
import OrdersModal from '../models/Orders.models'
import { Request, Response } from 'express'
import { IOrder } from '../interfaces/Orders.interfaces'
import OrdersSchemas from '../schemas/Orders.schemas'
import PaymentModal from '../models/Payment.models'
import { IStock } from '../interfaces/Stock.interfaces'

const modal = new OrdersModal()

export default class Orders {
    public async listen(req: Request, res: Response) {

        const orders = await modal.listenOrders()
        res.status(200).send(orders)

    }

    public async listenOrder(req: Request, res: Response) {

        const orders = await modal.listenOrder(req.params.email)
        res.status(200).send(orders)

    }

    public async edit(req: Request, res: Response) {

        const order = await modal.editOrder(req.params.id, req.body)
        res.status(200).send({ message: 'Pedido editado com sucesso.', order })

    }

    public async delete(req: Request, res: Response) {

        await modal.deleteOneById(req.params.id)
        res.status(200).send({ message: 'Pedido deletado com sucesso.'})

    }

    public async create(req: Request, res: Response) {

        const order = await modal.createOrder(req.body)
        res.status(200).send({ message: 'Pedido criado com sucesso', order })

    }

    public async invoice(req: Request, res: Response) {

        const orders: IOrder[] = await modal.listenOrdersByEmailAndFilteredByStatus(req.params.email, 'finalizado')
        let soma = 0

        /* Somando tudo */

        //O = Order
        orders.forEach((o) => {
            soma = (soma) + Math.floor(o.value * 30 / 100)

            //P = Pieces
            o.pieces.forEach((p) => {

                let count = Math.floor((p.value * 15) / 100)
                soma = (soma) + count

            })
        })
        
        /* Pegando as peças */

        let pieces = ''//Peças

        //O = Order
        orders.map((o) => {

            //P = Piece
            o.pieces.map((p, i) => {

                if(i === 0) {
                    
                    pieces = (pieces) + `${p.piece}`

                } else {

                    pieces = (pieces) + ` ${p.piece}`

                }
            })
        })

        /* Criando o LINK */

        const link = await modal.createLink({
            names: orders.map((o) => o.client.name).join(', '),
            ids: orders.map((o) => o.id).join(', '),
            soma
        })

        /* Criando o PAYMENT */
        
        const paymentModal = new PaymentModal()
        const payment = await paymentModal.createPayment({
            payment_id: link.body.id,
            tech: req.params.email,
            value: soma,
            pieces: `${pieces}`
        })

        res.status(200).send({ link: link.response.init_point, payment })

        //[x] - Listar todos os pedidos com o status FINALIZADO
        //[x] - Somar o valor da mão de obra de todos os pedidos
        //[x] - Visualizar as peças utilizadas nos pedidos
        //[x] - Pegar 15% de todas as peças
        //[x] - Somar junto com o valor da mão de obra
        //[x] - Criar o link

        //[x] - Criar payment

    }
}