import { ensureElement } from '../../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/EventEmitter';

interface IModalData {
	content: HTMLElement;
}

export class Modal<T> extends Component<IModalData> {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		// Инициализация элементов один раз при создании класса
		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			this.container
		);
		this._content = ensureElement<HTMLElement>(
			'.modal__content',
			this.container
		);

		// Обработчики событий
		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		this._content.addEventListener('click', (event) => event.stopPropagation());

		// Привязка метода для обработки события Escape
		this.handleEscUp = this.handleEscUp.bind(this);
	}

	// Установка контента модального окна
	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	// Открытие модального окна
	open() {
		this.toggleClass(this.container, 'modal_active', true);
		document.addEventListener('keyup', this.handleEscUp);
		this.events.emit('modal:open');
	}

	// Закрытие модального окна
	close() {
		this.toggleClass(this.container, 'modal_active', false);
		this.content = null;
		document.removeEventListener('keyup', this.handleEscUp);
		this.events.emit('modal:close');
	}

	// Рендеринг модального окна
	render(data: IModalData): HTMLElement {
		super.render(data);
		this.open();
		return this.container;
	}

	// Обработчик события нажатия клавиши Escape
	handleEscUp(evt: KeyboardEvent) {
		if (evt.key === 'Escape') {
			this.close();
		}
	}
}
