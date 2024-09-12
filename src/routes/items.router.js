import express, { response } from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

export default router;

//생성
router.post(`/items`, async (req, res, next) => {
  const { name, health, power, price } = req.body;

  const item = await prisma.items.create({
    data: {
      name: name,
      health: health,
      power: power,
      price: price,
    },
  });
  return res.status(201).json({ data: item });
});

//조회
router.get(`/items`, async (req, res, next) => {
  const items = await prisma.items.findMany({
    select: {
      itemId: true,
      name: true,
    },
  });
  return res.status(200).json({ data: items });
});

//상세조회
router.get(`/items/:itemId`, async (req, res, next) => {
  const { itemId } = req.params;

  const item = await prisma.items.findFirst({
    where: { itemId: +itemId },
    select: {
      itemId: true,
      name: true,
      health: true,
      power: true,
      price: true,
    },
  });

  if (!item) {
    return res.status(404).json({ message: `아이템이 존재하지 않습니다` });
  }

  return res.status(200).json({ data: item });
});

//수정

router.patch(`/items/:itemId`, async (req, res, next) => {
  const { itemId } = req.params;

  const isExist = await prisma.items.findFirst({
    where: {
      itemId: +itemId,
    },
  });

  if (!isExist) {
    return res.status(404).json({ message: `아이템이 존재하지 않습니다` });
  }

  const { name, health, power } = req.body;

  const updateItem = await prisma.items.update({
    where: {
      itemId: +itemId,
    },
    data: {
      name: name,
      health: health,
      power: power,
    },
  });

  return res.status(200).json({ data: updateItem });
});
