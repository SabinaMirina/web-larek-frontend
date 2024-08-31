import { ensureElement } from '../../utils/utils';
import { Component } from './base/Component';
import { IEvents } from './events';

interface IPage {
	counter: number;
	catalog: HTMLElement[];
	basketicon: HTMLElement;
	locked: boolean;
}

export class Page extends Component<IPage> {
	protected _catalog: HTMLElement;
	protected _basketicon: HTMLElement;
	protected _counter: HTMLElement;
	protected _wrapper: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._catalog = ensureElement<HTMLElement>('.gallery');
		this._basketicon = ensureElement<HTMLElement>('.header__basket');
		this._counter = ensureElement<HTMLElement>('.header__basket-counter');
		this._wrapper = ensureElement<HTMLElement>('.page__wrapper');

		this._basketicon.addEventListener('click', () =>
			this.events.emit('basket:openn', { basket: this })
		);
	}

	set counter(value: number) {
		this.setText(this._counter, String(value));
	}

	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items);
	}

	set locked(value: boolean) {
		if (value) {
			this._wrapper.classList.add('page__wrapper_locked');
		} else {
			this._wrapper.classList.remove('page__wrapper_locked');
		}
	}
}
