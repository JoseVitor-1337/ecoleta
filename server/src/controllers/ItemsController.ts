import { Request, Response } from "express";
import knex from "../database/connection";

class ItemsController {
  async index(request: Request, response: Response) {
    try {
      const items = await knex("items").select("*");

      const serializedItems = items.map((item) => {
        return {
          id: item.id,
          title: item.title,
          image_url: `http://192.168.0.114:3333/uploads/${item.image}`,
        };
      });

      return response.json({ items: serializedItems });
    } catch (error) {
      return response.json({ message: error });
    }
  }
}

export default new ItemsController();
