import { ensureElement } from '../../utils/utils';
import { Component } from './base/Component';
import { IEvents } from './base/EventEmitter';

interface IPage {
	counter: number;
	catalog: HTMLElement[];
	basketicon: HTMLElement;
	locked: boolean;
}

export class Page extends Component<IPage> {
	protected _catalog: HTMLElement;
	protected _basketIcon: HTMLElement; // Переименовано в camelCase
	protected _counter: HTMLElement;
	protected _wrapper: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		// Использование ensureElement с текущим контейнером
		this._catalog = ensureElement<HTMLElement>('.gallery', this.container);
		this._basketIcon = ensureElement<HTMLElement>(
			'.header__basket',
			this.container
		);
		this._counter = ensureElement<HTMLElement>(
			'.header__basket-counter',
			this.container
		);
		this._wrapper = ensureElement<HTMLElement>(
			'.page__wrapper',
			this.container
		);

		// Добавление обработчика клика на корзину
		this._basketIcon.addEventListener('click', () =>
			this.events.emit('basket:openn', { basket: this })
		);
	}

	// Установка значения счетчика
	set counter(value: number) {
		this.setText(this._counter, String(value));
	}

	// Установка элементов каталога
	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items);
	}

	// Управление блокировкой страницы
	set locked(value: boolean) {
		this.toggleClass(this._wrapper, 'page__wrapper_locked', value);
	}
}
