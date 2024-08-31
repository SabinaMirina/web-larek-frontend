import { Component } from "../base/Component";
import { IEvents } from "../events";

interface IModalData {
  content: HTMLElement;
}

export class Modal<T> extends Component<IModalData> {
  protected _closeButton: HTMLButtonElement;
  protected _content: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);


      this._closeButton = this.container.querySelector(".modal__close");
        this._content = this.container.querySelector(".modal__content");

        this._closeButton.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', this.close.bind(this));
        this._content.addEventListener('click', (event) => event.stopPropagation());
        this.handleEscUp = this.handleEscUp.bind(this);
      }

      set content(value: HTMLElement) {
        this._content.replaceChildren(value);
    }
    
      open() {
        this.container.classList.add('modal_active');
        document.addEventListener("keyup", this.handleEscUp);
        this.events.emit('modal:open');
          }
    
      close() {
        this.container.classList.remove('modal_active');
        this.content = null;
        document.removeEventListener("keyup", this.handleEscUp);
        this.events.emit('modal:close');
      }

      render(data: IModalData): HTMLElement {
        super.render(data);
        this.open();
        return this.container;
    }
    
      handleEscUp (evt: KeyboardEvent) {
          if (evt.key === "Escape") {
            this.close();
          }
        };
    }