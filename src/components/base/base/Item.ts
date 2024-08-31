import { IItem, ItemCategory } from '../../../types/index';
import { formatNumber } from '../../../utils/utils';
import { IEvents } from '../events';
import { Component } from './Component';

interface IItemBehaviour {
	onClick: (event: MouseEvent) => void;
}

export interface IItemCard extends IItem {
	index: number;
}

export abstract class Item extends Component<IItemCard> {
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _category?: HTMLElement;
	protected _price: HTMLElement;
	protected _button?: HTMLButtonElement;
	protected events: IEvents;
	protected cardGallery?: HTMLButtonElement;

	constructor(protected container: HTMLElement, actions?: IItemBehaviour) {
		super(container);

		// Инициализация полей карточки
		this._title = this.container.querySelector<HTMLElement>('.card__title');
		this._price = this.container.querySelector<HTMLElement>('.card__price');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	// Установка идентификатора карточки
	set id(value: string) {
		this.container.dataset.id = value;
	}

	// Установка заголовка карточки
	set title(value: string) {
		this.setText(this._title, value);
	}

	// Установка цены карточки
	set price(value: number) {
		if (value !== null && value !== undefined) {
			this.setText(this._price, `${formatNumber(value)} синапсов`);
		} else {
			this.setText(this._price, 'Бесценно');
		}
	}

	// // Установка текста кнопки карточки
	set buttonText(value: string) {
		this.setText(this._button, value);
	}

	// Установка состояния кнопки карточки
	set buttonStatus(value: number) {
		if (!value) {
			this.setDisabled(this._button, true);
		}
	}

	// Установка изображения карточки
	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	// Установка описания карточки
	set description(value: string) {
		this.setText(this._description, value);
	}

	// Установка категории карточки
	set category(value: ItemCategory) {
		this.setText(this._category, value);
	}
}

//Карточки в галлерее
export class ItemsGallery extends Item {
	protected _image: HTMLImageElement;
	protected _category: HTMLElement;
	protected cardGallery: HTMLButtonElement;

	constructor(protected container: HTMLElement, actions?: IItemBehaviour) {
		super(container, actions);

		// Инициализация полей для списка
		this._image =
			this.container.querySelector<HTMLImageElement>('.card__image');
		this._category =
			this.container.querySelector<HTMLElement>('.card__category');
		this.cardGallery =
			this.container.querySelector<HTMLButtonElement>('.gallery__item');
	}
}

// В модальном окне карточка
export class CardModal extends Item {
	constructor(protected container: HTMLElement, actions?: IItemBehaviour) {
		super(container);

		// Инициализация полей для предварительного просмотра
		this._image =
			this.container.querySelector<HTMLImageElement>('.card__image');
		this._category =
			this.container.querySelector<HTMLElement>('.card__category');
		this._description =
			this.container.querySelector<HTMLElement>('.card__text');
		this._button =
			this.container.querySelector<HTMLButtonElement>('.card__button');

		this._button.addEventListener('click', (event) => {
			event.preventDefault();
			actions?.onClick?.(event);
			console.log('ok');
		});
	}
}

// Класс карточки для корзины
export class CardBasket extends Item {
	protected _itemIndex: HTMLElement; // Индекс товара

	constructor(container: HTMLElement, actions?: IItemBehaviour) {
		super(container, actions);

		// Инициализация полей для карточки в корзине
		this._button =
			this.container.querySelector<HTMLButtonElement>('.card__button');
		this._itemIndex = this.container.querySelector<HTMLImageElement>(
			'.basket__item-index'
		);

		this._button.addEventListener('click', (event) => {
			event.preventDefault();
			actions?.onClick?.(event);
			console.log('ok');
		});
	}

	// Установка индекса товара
	set index(value: number) {
		this.setText(this._itemIndex, String(value));
	}

	// Установка ID товара в data-атрибут контейнера
	setItemId(id: string) {
		this.container.setAttribute('data-id', id);
	}

	// Метод для удаления карточки из DOM
	remove() {
		this.container.remove();
	}
}
