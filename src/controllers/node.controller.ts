import { Request, Response } from "express"
import { AppDataSource } from "../data-source"
import { Node } from "../entity/Node.entity"
import * as cache from 'memory-cache'
import { BadRequest, NotFound } from "../helpers/errors"
import * as dotenv from 'dotenv'
dotenv.config()

export class NodeController {

  static async getNode(req: Request, res: Response) {
    if (req.query['children']) {
      return NodeController.getNodeChildren(req, res)
    }
    const { nodePath } = req.params
    const node = await getNodeByPath(nodePath)
    if (!node) {
      return NotFound(res)
    }

    return res.status(200).json({ node })
  }

  static async createNode(req: Request, res: Response) {
    const { nodePath } = req.params
    const { name, type } = req.body

    if (!validateIsSlug(name)) {
      return BadRequest(res, 'Name must be a valid slug')
    }

    if (!nodePath) {
      const rootNode = new Node()
      rootNode.name = name
      rootNode.type = type
      try {
        await AppDataSource.getRepository(Node).save(rootNode)
      } catch (error) {
        return BadRequest(res, error.message)
      }
      return res.status(201).json({ node: rootNode })
    }

    const parent = await getNodeByPath(nodePath)
    if (!parent) {
      return NotFound(res)
    }

    const node = new Node()
    node.name = name
    node.type = type
    node.parent = parent

    const existingChild = await AppDataSource.getRepository(Node).findOne({ where: { parentId: parent.id, name: name } })
    if (existingChild) {
      return BadRequest(res, 'A child with the same name already exists')
    }

    try {
      await AppDataSource.getRepository(Node).save(node)
    } catch (error) {
      return BadRequest(res, error.message)
    }

    return res.status(201).json({ node })
  }

  static async updateNode(req: Request, res: Response) {
    const { nodePath } = req.params
    const { name, type } = req.body

    if (!validateIsSlug(name)) {
      return BadRequest(res, 'Name must be a valid slug')
    }

    const node = await getNodeByPath(nodePath)
    if (!node) return NotFound(res)

    node.name = name
    node.type = type

    try {
      await AppDataSource.getRepository(Node).save(node)
    } catch (error) {
      return BadRequest(res, error.message)
    }

    return res.status(200).json({ node })
  }

  static async deleteNode(req: Request, res: Response) {
    const node = await getNodeByPath(req.params.nodePath)
    if (!node) return NotFound(res)

    try {
      await AppDataSource.getRepository(Node).remove(node)
    } catch (error) {
      return BadRequest(res, error.message)
    }

    return res.status(204).json()
  }

  static async getNodeChildren(req: Request, res: Response) {
    const { nodePath } = req.params
    const node = await getNodeByPath(nodePath)
    if (!node) {
      return NotFound(res)
    }

    const children = await AppDataSource.getRepository(Node).find({ where: { parent: { id: node.id } } })
    return res.status(200).json({ children })
  }

  static async getNodeTree(req: Request, res: Response) {
    const { depth, parentId } = req.query
    const cachedData = cache.get(`node-tree-${depth}-${parentId}`)
    if (cachedData && process.env['ENABLE_CACHE'] === 'true') {
      return res.status(200).json({ tree: cachedData })
    }

    let root = null

    let parentIdNumber: number | null = null
    try {
      parentIdNumber = parseInt(parentId as string)
    } catch (error) { }

    const nodeRepository = AppDataSource.getRepository(Node)
    const queryOptions: any = {}

    if (parentId) {
      root = await nodeRepository.findOne({ where: { id: parentIdNumber } })
    } else {
      root = await nodeRepository.findOne({ where: { parent: null } })
    }

    if (!root) {
      return NotFound(res)
    }

    if (depth) {
      queryOptions.depth = parseInt(depth as string)
    }
    const tree = await AppDataSource.getTreeRepository(Node).findDescendantsTree(root, {
      relations: ['parent', 'children'],
      depth: queryOptions.depth,
    })

    if (!tree) {
      return NotFound(res)
    }

    cache.put(`node-tree-${depth}-${parentId}`, tree, 60000)
    return res.status(200).json({ tree })
  }
}

const getNodeByPath = async (path: string) => {
  const pathParts = path.split('/').filter(p => p)
  let parent = null

  for (const part of pathParts) {
    const node = await AppDataSource.getRepository(Node).findOne({ where: { parentId: parent ? parent.id : null, name: part } })
    if (!node) {
      return null
    }
    parent = node
  }

  return parent
}

const validateIsSlug = (slug: string) => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}