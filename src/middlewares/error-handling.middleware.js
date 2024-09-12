export default function (err, req, res, next) {
  console.error(err);

  res.status(500).json({ message: `서버에러 발생` });
}
