import { IApi, IItem, TOrder, IOrderData } from '../../types';

export class AppApi {
	private _baseApi: IApi;
	readonly cdn: string;

	constructor(cdn: string, baseApi: IApi) {
		this._baseApi = baseApi;
		this.cdn = cdn;
	}

	getLoadItem(id: string): Promise<IItem> {
		return this._baseApi.get(`/product/${id}`).then((item: IItem) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	loadItems(): Promise<IItem[]> {
		return this._baseApi
			.get<{ items: IItem[] }>('/product')
			.then((response) => {
				const cards = response.items; // Извлекаем массив карточек из объекта
				return cards.map((card) => ({
					...card,
					image: this.cdn + card.image,
				}));
			});
	}

	postOrder(order: TOrder): Promise<IOrderData> {
		console.log('Отправка заказа на сервер:', order);
		return this._baseApi
			.post<IOrderData>('/order', order)
			.then((res) => {
				console.log(`Заказ успешно создан. Сообщение сервера: ${res}`);
				return res; // Убедитесь, что res соответствует типу IOrderData
			})
			.catch((error) => {
				const errorMessage = error?.message || 'Unknown error';
				console.error('Ошибка при создании заказа:', errorMessage);
				return Promise.reject(new Error(errorMessage)); // Возвращаем Promise.reject для соответствия типу возвращаемого значения
			});
	}

	getOrderById(id: string): Promise<IOrderData | null> {
		return this._baseApi
			.get<IOrderData>(`/order/${id}`)
			.then((order: IOrderData) => {
				return order || null;
			});
	}
}
