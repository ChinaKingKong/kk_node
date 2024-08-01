const { PrismaClient } = require('@prisma/client');
const router = require('express').Router();
const prisma = new PrismaClient();

// 获取用户信息
router.get('/profile', async (req, res) => {
  try {
    const profile = await prisma.userProfile.findFirst({
      orderBy: {
        id: 'desc',
      },
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read profile' });
  }
});

// 编辑用户信息
router.post('/profile', async (req, res) => {
  const { id, username, email, phone } = req.body;
  try {
    let profile;
    if (id && id > 0) {
      // 更新用户信息
      profile = await prisma.userProfile.update({
        where: { id: id },
        data: { username, email, phone },
      });
    } else {
      // 检查用户是否已经存在
      const existingUser = await prisma.userProfile.findFirst({
        where: {
          OR: [{ email }, { phone }],
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: '用户已存在' });
      }
      // 创建新用户信息
      profile = await prisma.userProfile.create({
        data: { username, email, phone },
      });
    }

    res.json(profile);
  } catch (error) {
    console.error(error); // 添加错误日志以便调试
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// 删除用户信息
router.delete('/profile/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 检查用户是否存在
    const existingUser = await prisma.userProfile.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingUser) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 删除用户信息
    await prisma.userProfile.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: '用户信息已删除' });
  } catch (error) {
    console.error(error); // 添加错误日志以便调试
    res.status(500).json({ error: 'Failed to delete profile id=' + id });
  }
});

module.exports = router;
