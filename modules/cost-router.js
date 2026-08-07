/**
 * Athelgard Cost Router Expansion
 *
 * Provider-neutral routing for the voice/CLI gateway. The client can render the
 * returned decision before a request is sent, so Kiran always sees the active
 * model, why it was selected, and the price policy that caused the switch.
 *
 * Time windows are deliberately configuration, not a DeepSeek fact baked into
 * source: pricing policies change and deployments may use a different timezone.
 */
export const ATHELGARD_COST_ROUTER_EVENTS = Object.freeze({
  DECISION: 'athelgard:model-selected',
  FALLBACK: 'athelgard:model-fallback',
});

const asMinutes = (value) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || ''));
  if (!match) throw new Error(`Invalid clock value: ${value}`);
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) throw new Error(`Invalid clock value: ${value}`);
  return hours * 60 + minutes;
};

const inWindow = (minute, window) => {
  const start = asMinutes(window.start);
  const end = asMinutes(window.end);
  return start === end ? false : start < end
    ? minute >= start && minute < end
    : minute >= start || minute < end;
};

const isoClock = (now, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return { clock: `${get('hour')}:${get('minute')}`, timeZone };
};

/**
 * @param {object} config
 * @param {string} config.primaryModel DeepSeek model id, e.g. deepseek-chat
 * @param {string} config.fallbackModel Provider/model id for peak or failure
 * @param {Array<{start:string,end:string,label?:string}>} config.peakWindows
 * @param {string} [config.timeZone='UTC'] IANA timezone used by provider policy
 * @param {(request: object, model: string) => Promise<object>} [config.complete]
 * @param {object} [config.eventBus]
 */
export function createAthelgardCostRouter(config = {}) {
  const {
    primaryModel = 'deepseek-chat',
    fallbackModel = 'deepseek-chat',
    peakWindows = [],
    timeZone = 'UTC',
    complete,
    eventBus,
  } = config;

  const decide = ({ now = new Date(), forceModel, purpose = 'general' } = {}) => {
    if (forceModel) return Object.freeze({ model: forceModel, source: 'override', purpose, peak: false });
    const { clock } = isoClock(now, timeZone);
    const peakWindow = peakWindows.find((window) => inWindow(asMinutes(clock), window));
    const decision = Object.freeze({
      model: peakWindow ? fallbackModel : primaryModel,
      source: peakWindow ? 'peak-policy' : 'standard-policy',
      purpose,
      peak: Boolean(peakWindow),
      peakLabel: peakWindow?.label || null,
      clock,
      timeZone,
    });
    eventBus?.emit?.(ATHELGARD_COST_ROUTER_EVENTS.DECISION, decision);
    return decision;
  };

  const completeWithRoute = async (request, options = {}) => {
    if (typeof complete !== 'function') throw new Error('A provider completion function is required');
    const decision = decide(options);
    try {
      const response = await complete(request, decision.model);
      return Object.freeze({ ...response, route: decision, fallbackUsed: false });
    } catch (error) {
      if (decision.model === fallbackModel) throw error;
      const fallback = Object.freeze({ ...decision, model: fallbackModel, source: 'provider-fallback' });
      eventBus?.emit?.(ATHELGARD_COST_ROUTER_EVENTS.FALLBACK, { decision, error: String(error?.message || error) });
      const response = await complete(request, fallback.model);
      return Object.freeze({ ...response, route: fallback, fallbackUsed: true });
    }
  };

  return Object.freeze({ decide, complete: completeWithRoute });
}

export const ATHELGARD_COST_ROUTER_EXPANSION = Object.freeze({
  id: 'athelgard-cost-router',
  title: 'Athelgard Cost Router',
  version: '1.0.0',
  dependencies: [],
  install: createAthelgardCostRouter,
});
