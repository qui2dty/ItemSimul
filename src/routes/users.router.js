import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(`/sign-up`, async (req, res, next) => {
  try {
    const { account, password, name, age } = req.body;

    const isExistUser = await prisma.users.findFirst({
      where: { account },
    });

    if (isExistUser) {
      return res.status(409).json({ message: `이미 존재하는 계정입니다` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: { account, password: hashedPassword },
    });

    const userInfo = await prisma.userInfos.create({
      data: {
        userId: user.userId,
        name,
        age,
      },
    });

    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (err) {
    next(err);
  }
});

/* <aside>
💡 **[게시판 프로젝트]  로그인 API 비즈니스 로직**

1. `account`, `password`를 **body**로 전달받습니다.
2. 전달 받은 `account`에 해당하는 사용자가 있는지 확인합니다.
3. 전달 받은 `password`와 데이터베이스의 저장된 `password`를 bcrypt를 이용해 검증합니다.
4. 로그인에 성공한다면, 사용자에게 JWT를 발급합니다.
</aside> */

router.post("/sign-in", async (req, res, next) => {
  const { account, password } = req.body;
  const user = await prisma.users.findFirst({ where: { account } });

  if (!user)
    return res.status(401).json({ message: "존재하지 않는 계정입니다." });
  else if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

  const token = jwt.sign(
    {
      userId: user.userId,
    },
    "custom-secret-key"
  );

  res.cookie("authorization", `Bearer ${token}`);
  return res.status(200).json({ message: "로그인 성공" });
});

router.get(`/users`, authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const user = await prisma.users.findFirst({
    where: { userId: +userId },
    select: {
      userId: true,
      account: true,
      userInfos: {
        select: {
          name: true,
          age: true,
        },
      },
    },
  });
  return res.status(200).json({ data: user });
});

router.delete("/users/:userId", authMiddleware, async (req, res, next) => {
  const { userId } = req.params;

  const isExist = await prisma.users.findFirst({
    where: {
      userId: +userId,
    },
  });

  //  if (!isExist || isExist.userId !== userId)
  //    return res.status(404).json({ message: "유저 조회에 실패하였습니다." });

  await prisma.users.delete({
    where: {
      userId: +userId,
    },
  });
  return res
    .status(200)
    .json({ massage: `유저 '${isExist.account}'를 삭제하였습니다.` });
});

export default router;
