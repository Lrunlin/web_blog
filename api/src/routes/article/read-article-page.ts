import express, { NextFunction, Response, Request } from "express";
const app = express();
const router = express.Router();
import { Article } from "@/db";
import cache from "@/common/middleware/cache";
import Sequelize, { Op } from "sequelize";
interface whereType {
  [key: string]: any;
}
router.get("/article/page/:page",cache, async (req: Request, res: Response, next: NextFunction) => {
  const page: number = +req.params.page;
  let where: whereType = req.query.type
    ? {
        type: {
          [Op.like]: `%${req.query.type}%`,
        },
      }
    : {};

  if (req.query.adminOnly) {
    where.author = "admin";
  }

  // Article.hasMany(Comment);
  // Comment.belongsTo(Article, { foreignKey: "articleId", targetKey: "id" });
  
  const { count, rows } = await Article.findAndCountAll({
    offset: (page - 1) * 10,
    limit: 10,
    attributes: [
      "id",
      "time",
      "title",
      "article",
      "introduce",
      "view_count",
      "author",
      "type",
      "image",
      [
        Sequelize.literal(`(
            SELECT COUNT(articleId)
            FROM comment AS comment
            WHERE
                comment.articleId = article.id
                )`),
        "comment_count",
      ],
    ],
    where: where,
    order: [["time", "desc"]],
  });

  res.json({
    success: !!rows,
    message: `查询第${page}页的文章`,
    total: count,
    data: rows.map(item => {
      //!查询列表时候需要introduce删除article无法生成introduce，所以数据库操作时候保留article返回数据时候删除article
      //?防止传输数据过大
      return {
        id: item.id,
        time: item.time,
        title: item.title,
        introduce: item.introduce,
        view_count: item.view_count,
        image: item.image,
        comment_count: (item as any).dataValues.comment_count,
        type: item.type,
        author: item.author,
      };
    }),
  });
});

export default router;
