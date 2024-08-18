export type ItemCategory = 'софт-скил' | 'хард-скил' | 'другое' | 'дополнительное' | 'кнопка' ;
export type PaymentCategory = 'Онлайн' | 'При получении';

export interface IItem {
    _id: string;
    description: string;
    image: string;
    title: string;
    category: ItemCategory;
    price: number | null;
}

export interface IItemsData {
    cards: IItem[];
    preview: string | null;
    loadItems(): Promise<void>;
    getItemById(cardId: string): Promise<IItem>;
}



export interface IBasket {
    basketTotal: number;
    items: Map<string, number>;
    addItemtoBasket(id: string): void;
    removeItemFromBasket(id: string): void;
    clearBasket(): void;
}


export interface IInformationCustomer {
    payment: PaymentCategory;
    email: string;
    phone: string;
    address: string;
    checkValidationDeliver(data: Record<keyof TFormDeliver, string>): boolean;
    checkValidationContact(data: Record<keyof TFormContact, string>): boolean;
}


export interface IOrder extends IInformationCustomer {
    total: number;
    items: IItem[];
    postOrder(Order: IOrder): Promise<IOrderResult>;
    getOrderById(id: string): Promise<IOrder>;
}

export interface IOrderResult {
    Id: string;
    total: number;
}


export type TItemGallery = Pick<IItem, 'category' | 'title' | 'image' | 'price'>;

export type TItemInfo = Pick<IItem, 'category' | 'title' | 'image' | 'description' | 'price'>;

export type TItemBasket = Pick<IItem, '_id' | 'title' | 'price'>;

export type TFormDeliver = Pick<IInformationCustomer, 'address' >;

export type TFormContact = Pick<IInformationCustomer, 'email' | 'phone'>;

export interface IAppState {
    catalog: IItem[];
    basket: IBasket;
    preview: string | null;
    order: IOrder | null;
    loading: boolean;
}
