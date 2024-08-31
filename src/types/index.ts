export type ItemCategory =
	| 'софт-скил'
	| 'хард-скил'
	| 'другое'
	| 'дополнительное'
	| 'кнопка';
export enum PaymentCategory {
	online = 'online',
	cash = 'Cash',
}

export interface IItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: ItemCategory;
	price: number;
}

export interface IItemsData {
	cards: IItem[];
	preview: string | null;
	setCardsInfo(cards: IItem[]): void;
	getCardById(cardId: string): IItem | undefined;
}

export interface IBasket {
	basketTotal: number;
	title: string;
	items: IItem[];
}

export interface IInformationCustomerData {
	payment: PaymentCategory;
	email: string;
	phone: string;
	address: string;
}

export interface IOrderData extends IInformationCustomerData {
	total: number;
	items: string[];
}

export interface IOrderResult {
	id: string;
	total: number;
}

export type TOrder = Pick<
	IOrderData,
	'total' | 'items' | 'payment' | 'email' | 'phone' | 'address'
>;

export interface IAppState {
	catalog: IItem[];
	basket: string[];
	preview: string | null;
	order: IOrderData | null;
	loading: boolean;
}

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
	baseUrl: string;
	get<T>(uri: string): Promise<T>;
	post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

//
export type FormErrors = Partial<Record<keyof IOrderData, string>>;
