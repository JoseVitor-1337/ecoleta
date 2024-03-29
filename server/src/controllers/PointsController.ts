import { Request, Response } from "express";
import knex from "../database/connection";

class PointsController {
  async create(request: Request, response: Response) {
    const { name, email, whatsapp, latitude, longitude, city, uf, items } =
      request.body;

    const point = {
      image: request.file?.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    const trx = await knex.transaction();

    try {
      const [insertedId] = await trx("points").insert(point);

      const pointItems = items
        .split(",")
        .map((item: string) => Number(item.trim()))
        .map((item_id: number) => {
          return {
            item_id,
            point_id: insertedId,
          };
        });

      await trx("point_items").insert(pointItems);

      await trx.commit();

      return response.json({ id: insertedId, ...point });
    } catch (error) {
      return response.json({ message: error });
    }
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    try {
      const point = await knex("points").where("id", id).first();

      if (!point) throw Error("Não foi encontrado nenhum ponto");

      const items = await knex("items")
        .join("point_items", "items.id", "=", "point_items.item_id")
        .where("point_items.point_id", id);

      const serializedPoint = {
        ...point,
        image_url: `http://192.168.0.114:3333/uploads/${point.image}`,
      };

      return response.json({ point: serializedPoint, items });
    } catch (error) {
      return response.json({ message: error });
    }
  }

  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));

    const points = await knex("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .whereIn("point_items.item_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");

    const serializedPoints = points.map((point) => {
      return {
        ...point,
        image_url: `http://192.168.0.114:3333/uploads/${point.image}`,
      };
    });

    try {
      return response.json({ points: serializedPoints });
    } catch (error) {
      return response.json({ message: error });
    }
  }
}

export default new PointsController();
