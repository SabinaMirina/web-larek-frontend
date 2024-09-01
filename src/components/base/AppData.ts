import _ from 'lodash';
import {
	FormErrors,
	IAppState,
	IItem,
	IOrderData,
	ItemCategory,
	PaymentCategory,
} from '../../types';
import { Model } from './base/Model';

export type CatalogItemEvent = {
	catalog: ItemCatalog[];
};

export class ItemCatalog extends Model<IItem> {
	id: string;
	description: string;
	image: string;
	title: string;
	category: ItemCategory;
	price: number;
}

export class AppState extends Model<IAppState> {
	catalog: ItemCatalog[];
	basket: [];
	loading: boolean;
	order: IOrderData = {
		total: 0,
		items: [],
		payment: PaymentCategory.online,
		email: '',
		phone: '',
		address: '',
	};
	preview: string | null;
	formErrors: FormErrors = {};

	// Метод для обновления заказа Оплата и адрес
	updateOrderDeliver(payment: PaymentCategory, address: string) {
		this.order.payment = payment;
		this.order.address = address;
		this.events.emit('order:payment-address-form-updated', {
			order: this.order,
		});
	}

	// Метод для обновления заказа Контакты
	updateOrderContacts(email: string, phone: string) {
		this.order.email = email;
		this.order.phone = phone;
		this.events.emit('order:payment-address-form-updated', {
			order: this.order,
		});
	}

	// Добавление или удаление товара из заказа
	toggleOrderedItem(id: string, isIncluded: boolean) {
		const index = this.order.items.indexOf(id);
		if (isIncluded && index === -1) {
			this.order.items.push(id);
		} else if (!isIncluded && index !== -1) {
			this.order.items.splice(index, 1);
		}

		// Обновляем общую стоимость заказа
		this.order.total = this.getTotal();
		this.emitChanges('order:itemsUpdated', { items: this.order.items });
	}

	// Метод для подсчета количества товаров в заказе
	getOrderItemCount(): number {
		if (this.order && Array.isArray(this.order.items)) {
			return this.order.items.length;
		}
		// Если items не определён или не является массивом, возвращаем 0
		return 0;
	}

	getOrderItems(): IOrderData {
		return this.order;
	}

	// Очистка корзины
	clearBasket() {
		this.order.items = [];
		this.order.total = 0; // Сброс суммы заказа
		this.emitChanges('order:cleared');
	}

	// Расчёт общей стоимости заказа
	getTotal() {
		// Если каталог ещё не загружен или пуст, возвращаем 0
		if (!this.catalog || this.catalog.length === 0) {
			return 0;
		}

		return this.order.items.reduce((total, itemId) => {
			const item = this.catalog.find((item) => item.id === itemId);
			return total + (item ? item.price : 0);
		}, 0);
	}

	// Установка каталога товаров
	setCatalog(items: IItem[]) {
		this.catalog = items.map((item) => new ItemCatalog(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	// Установка просмотра товара
	setPreview(item: ItemCatalog) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	getcatalog(): ItemCatalog[] {
		return this.catalog;
	}
}
