export interface UsersShoppingData{
    username: string,
    receipts: [
        {
            rid: number,
            items: number[],
            purchaseDate: Date,
            refill: [
                {
                    id: number,
                    refillDate: Date
                }
            ]
        }
    ],
    wishlist: number[]
}