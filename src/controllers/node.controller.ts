import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Node } from "../entity/Node.entity";
import * as cache from 'memory-cache'

export class NodeController {
  static async getNodeTree(req: Request, res: Response) {
    const { depth, parentId } = req.query;
    const cachedData = cache.get(`node-tree-${depth}-${parentId}`);
    if (cachedData) {
      return res.status(200).json({ tree: cachedData });
    }

    let root = null;

    let parentIdNumber: number | null = null;
    try {
      parentIdNumber = parseInt(parentId as string);
    } catch (error) { }

    const nodeRepository = AppDataSource.getRepository(Node);
    const queryOptions: any = {};

    if (parentId) {
      root = await nodeRepository.findOne({ where: { id: parentIdNumber } });
    } else {
      root = await nodeRepository.findOne({ where: { parent: null } });
    }

    if (!root) {
      return res.status(404).json({ message: 'Root node not found' });
    }

    if (depth) {
      queryOptions.depth = parseInt(depth as string);
    }
    const tree = await AppDataSource.getTreeRepository(Node).findDescendantsTree(root, {
      relations: ['parent', 'children'],
    });

    if (!tree) {
      return res.status(404).json({ message: 'Tree not found' });
    }

    cache.put(`node-tree-${depth}-${parentId}`, tree, 60000);
    return res.status(200).json({ tree });
  }

  static async createNode(req: Request, res: Response) {
    const { name, type, parentId } = req.body
    const nodeRepository = AppDataSource.getRepository(Node)
    let parent = null

    if (parentId) {
      parent = await nodeRepository.findOne({ where: { id: parentId } })

      if (!parent) {
        return res.status(404).json({ message: 'Parent not found' })
      }
    }

    const node = new Node()
    node.name = name
    node.type = type
    node.parent = parent

    try {
      await nodeRepository.save(node)
    } catch (error) {
      return res.status(400).json({ message: error.message })
    }

    return res.status(201).json({ node })
  }

  static async updateNode(req: Request, res: Response) {
    const { id, name, type, parentId } = req.body
    const nodeRepository = AppDataSource.getRepository(Node)
    const node = await nodeRepository.findOne({ where: { id } })

    if (!node) {
      return res.status(404).json({ message: 'Node not found' })
    }

    const parent = await nodeRepository.findOne({ where: { id: parentId } })
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' })
    }

    node.name = name
    node.type = type
    node.parent = parent

    try {
      await nodeRepository.save(node)
    } catch (error) {
      return res.status(400).json({ message: error.message })
    }

    return res.status(200).json({ node })
  }

  static async deleteNode(req: Request, res: Response) {
    const { id } = req.body
    const nodeRepository = AppDataSource.getRepository(Node)
    const node = await nodeRepository.findOne({ where: { id } })

    if (!node) {
      return res.status(404).json({ message: 'Node not found' })
    }

    try {
      await nodeRepository.remove(node)
    } catch (error) {
      return res.status(400).json({ message: error.message })
    }

    return res.status(204).json()
  }

  static async getNodeById(req: Request, res: Response) {
    const { id } = req.body
    const nodeRepository = AppDataSource.getRepository(Node)
    const node = await nodeRepository.findOne({ where: { id } })

    if (!node) {
      return res.status(404).json({ message: 'Node not found' })
    }

    return res.status(200).json({ node })
  }

  static async getRootNode(req: Request, res: Response) {
    const nodeRepository = AppDataSource.getRepository(Node)
    const node = await nodeRepository.findOne({ where: { parent: null } })

    if (!node) {
      return res.status(404).json({ message: 'Root node not found' })
    }

    return res.status(200).json({ node })
  }
}