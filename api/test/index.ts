export default function handler(req: any, res: any) {
  res.status(200).json({ test: true, message: "Test endpoint works" });
}
