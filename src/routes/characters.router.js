import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(`/characters`, authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const { name } = req.body;

  const character = await prisma.characters.create({
    data: {
      userId: +userId,
      name: name,
      health: 100,
      power: 10,
      gold: 10000,
    },
  });
  return res.status(201).json({ data: character });
});

router.get(`/characters`, async (req, res, next) => {
  const characters = await prisma.characters.findMany({
    select: {
      userId: true,
      characterId: true,
      name: true,
    },
  });
  return res.status(200).json({ data: characters });
});

router.get(`/characters/:characterId`, async (req, res, next) => {
  const { characterId } = req.params;

  const character = await prisma.characters.findFirst({
    where: { characterId: +characterId },
    select: {
      userId: true,
      characterId: true,
      name: true,
      health: true,
      power: true,
      gold: true,
    },
  });
  if (!character)
    return res
      .status(404)
      .json({ message: "해당 케릭터가 존재하지 않습니다." });

  return res.status(200).json({ data: character });
});

router.delete(
  "/characters/:characterId",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { characterId } = req.params;

      const isExist = await prisma.characters.findFirst({
        where: {
          characterId: +characterId,
        },
      });

      if (!isExist || isExist.userId !== userId)
        return res
          .status(404)
          .json({ message: "캐릭터 조회에 실패하였습니다." });

      await prisma.characters.delete({
        where: {
          characterId: +characterId,
          userId,
        },
      });
      return res
        .status(200)
        .json({ massage: `캐릭터 '${isExist.name}'를 삭제하였습니다.` });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
