# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

Данные для категории товара

```
export type ItemCategory = 'софт-скил' | 'хард-скил' | 'другое' | 'дополнительное' | 'кнопка' ;
```

Товар

```
export interface IItem {
    _id: string;
    description: string;
    image: string;
    title: string;
    category: ItemCategory;
    price: number | null;
}
```

Интерфейс для модели данных товаров

```
export interface IItemsData {
    cards: IItem[];
    preview: string | null;
    loadItems(): Promise<void>;
    getItemById(cardId: string): Promise<IItem>;
}
```
Корзина

```
export interface IBasket {
    basketTotal: number;
    items: Map<string, number>;
    addItemtoBasket(id: string): void;
    removeItemFromBasket(id: string): void;
    clearBasket(): void;
}
```

Данные для категории оплаты

```
export type PaymentCategory = 'Онлайн' | 'При получении';
```

Данные покупателя

```
export interface IInformationCustomer {
    payment: PaymentCategory;
    email: string;
    phone: string;
    address: string;
    checkValidationDeliver(data: Record<keyof TFormDeliver, string>): boolean;
    checkValidationContact(data: Record<keyof TFormContact, string>): boolean;
}
```

Данные заказа

```
export interface IOrder extends IInformationCustomer {
    total: number;
    items: IItem[];
    postOrder(Order: IOrder): Promise<IOrderResult>;
    getOrderById(id: string): Promise<IOrder>;
}
```

Данные для результата заказа

```
export interface IOrderResult {
    Id: string;
    total: number;
}
```

Данные товара, используемые для вывода в галерее карточек

```
export type TItemGallery = Pick<IItem, 'category' | 'title' | 'image' | 'price'>;
```

Данные товара, используемые в модальном окне общей информации о карточке

```
export type TItemInfo = Pick<IItem, 'category' | 'title' | 'image' | 'description' | 'price'>;

```

Данные товара, используемые в модальном окне корзины

```
export type TItemBasket = Pick<IItem, '_id' | 'title' | 'price'>;
```

Данные заказа, используемые в модальном окне оформления доставки

```
export type TFormDeliver = Pick<IInformationCustomer, 'address' >;
```

Данные заказа, используемые в модальном окне контактных данных 

```
export type TFormContact = Pick<IInformationCustomer, 'email' | 'phone'>;
```

Описание состояния приложения 

```
interface IAppState {
    catalog: IItem[];
    basket: IBasket;
    preview: string | null;
    order: IOrder | null;
    loading: boolean;
}
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP: 
- слой представления, отвечает за отображение данных на странице, 
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы: 
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.  
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие   

### Слой данных

#### Класс ItemsData
Класс отвечает за хранение и логику работы с данными товаров.\
Конструктор класса принимает инстант брокера событий\
В полях класса хранятся следующие данные:
- cards: IItem[] - массив объектов товаров
- preview: string | null - id товара, выбранного для просмотра в модальном окне
- events: IEvents - экземпляр класса `EventEmitter` для инициации событий при изменении данных.

Так же класс предоставляет набор методов для взаимодействия с этими данными.
- loadItems(): Promise<void> - подгружает карточки с сервера
- getItemById(cardId: string): Promise<IItem> - возвращает товар по его id
- а так-же сеттеры и геттеры для сохранения и получения данных из полей класса

#### Класс OrderData
Класс отвечает за хранение и логику работы с данными заказа.\
Конструктор класса принимает инстант брокера событий\
В полях класса хранятся следующие данные:
- payment: PaymentCategory - данные о способе оплаты заказа
- email: string - данные о почте на которой сделан заказ
- phone: string - данные о телефоне на который сделан заказ
- address: string - данные о адресе на который сделан заказ
- total: number - данные о полной сумме заказа
- items: IItem[] - массив товаров помещенных в заказ

Так же класс предоставляет набор методов для взаимодействия с этими данными.
- postOrder(order: IOrder): Promise<IOrderResult> - отправляет заказ на сервер
- getOrderById(id: string): Promise<IOrder>  - возвращает заказ по id
- checkValidation(data: Record<keyof TOrderValidation, string>): boolean - проверяет объект с данными о заказе на валидность

#### Класс Basket
Класс отвечает за хранение и логику работы с данными корзины.\
Конструктор класса принимает инстант брокера событий\
В полях класса хранятся следующие данные:
- basketTotal: number; - сумма корзины
- items: Map<string, number> - товары в корзине

Так же класс предоставляет набор методов для взаимодействия с этими данными.
- addItemToBasket(id: string): void - добавить товары в корзину
- removeCardFromBasket(id: string): void; - удаление одного продукта из корзины
- clearBasket(): void; - очищение корзины

### Классы представления
Все классы представления отвечают за отображение внутри контейнера (DOM-элемент) передаваемых в них данных.

#### Абстрактный класс Component
Данный класс предоставляет полезные методы для работы с элементами DOM, такие как toggleClass, setText, setDisabled, setHidden, setVisible, и setImage. Эти методы упрощают взаимодействие с элементами и делают код более читабельным и повторно используемым.

- constructor(protected readonly container: HTMLElement) 

Методы:
- toggleClass(element: HTMLElement, className: string, force?: boolean): void - Переключение класса
-  setText(element: HTMLElement, value: unknown): void - установка текстового значения
- setDisabled(element: HTMLElement, state: boolean): void -  предназначен для управления состоянием доступности HTML-элемента, такого как кнопка, поле ввода и другие элементы, которые могут быть отключены.
- setHidden(element: HTMLElement): void - скрывает элемент
- setVisible(element: HTMLElement): void - показывает элемент
- setImage(element: HTMLImageElement, src: string, alt?: string) : void - ставит атрибуты изображения
- render(data?: Partial<T>): HTMLElement - предназначен для обновления и отображения содержимого компонента в DOM на основе переданных данных.

#### interface IPageCardsContainer
 - catalog: HTMLElement[];
 - locked: boolean;

#### Класс PageCardsContainer
 Наследует от класса Component. Отвечает за отображение галлереи с продуктами на главной странице. В конструктор принимает контейнер, в котором размещаются карточки с продуктами.


#### interface ICard
    category: string;
    title: string;
    image: string;
    price: string;


#### Класс Card
 Наследует от класса Component.Отвечает за отображение карточки продукта в галлерее , задавая в карточке данные названия, изображения, категории и цены. В конструктор класса передается DOM элемент темплейта, что позволяет при необходимости формировать карточки продуктов разных вариантов верстки.\
Поля класса содержат элементы разметки элементов карточки. Конструктор, кроме темплейта принимает экземпляр `EventEmitter` для инициации событий.\
поля класса:
- category: string;
- title: HTMLElement;
- image: HTMLImageElement;
- price: string;


Методы:
- setData(cardData: ICard, userId: string): void - заполняет атрибуты элементов карточки данными
-- геттер id возвращает уникальный id карточки


#### Класс Modal
Наследует от класса Component.Реализует модальное окно. Так же предоставляет методы `open` и `close` для управления отображением модального окна. Устанавливает слушатели на клавиатуру, для закрытия модального окна по Esc, на клик в оверлей и кнопку-крестик для закрытия модального окна.

- constructor(selector: HTMLElement, events: IEvents) Конструктор принимает селектор, по которому в разметке страницы будет идентифицировано модальное окно и экземпляр класса `EventEmitter` для возможности инициации событий.

Поля класса
- modal: HTMLElement - элемент модального окна
- template: HTMLTemplateElement;
- events: IEvents - брокер событий
- closeButton: HTMLButtonElement;

Методы:
- open(): void
- close(): void

#### interface IModalItem 
    category: string;
    title: string;
    description?: string | string[];
    image: string;
    price: string;

#### Класс ModalItem 
Расширяет класс Modal. Предназначен для реализации модального окна с описанием продукта.

Поля класса: 
- category: string;
- title: string;
- description?: string | string[];
- image: string;
- price: string;
- orderButton: HTMLButtonElement - Кнопка заказа

constructor(selector: string, templateId: string, events: IEvents, itemInfo: TItemInfo)

Методы класса:
-  renderTemplate(): void

#### interface IModalBasket
- items: HTMLElement[];
- total: number;
- selected: string[];

#### Класс ModalBasket 
Расширяет класс Modal. Предназначен для реализации модального окна корзины.

Поля:
- orderButton: HTMLButtonElement - Кнопка заказа
- list: HTMLElement;
- total: HTMLElement;

 constructor(selector: string, templateId: string, events: IEvents, basket: IBasket) 

 Методы:
 - renderTemplate(): void

 #### interface IModalSuccess 
- items: HTMLElement[];
- total: number;
- selected: string[];

#### Класс ModalSuccess 
Расширяет класс Modal. Предназначен для реализации модального окна с сообщением что заказ оформлен.

#### Класс ModalWithForm
Расширяет класс Modal. Предназначен для реализации модального окна с формой содержащей поля ввода. При сабмите инициирует событие передавая в него объект с данными из полей ввода формы. При изменении данных в полях ввода инициирует событие изменения данных. Предоставляет методы для отображения ошибок и управления активностью кнопки сохранения.\
Поля класса:
- submitButton: HTMLButtonElement - Кнопка подтверждения
- _form: HTMLFormElement - элемент формы
- formName: string - значение атрибута name формы
- _ToggleButton?: HTMLElement - тогл кнопка
- ToggleButtonName?: string - значение тогл кнопки
- inputs: NodeListOf<HTMLInputElement> - коллекция всех полей ввода формы
- Toggles?: NodeListOf<HTMLInputElement> - значение тогл кнопок
- errors: Record<string, HTMLElement> - объект хранящий все элементы для вывода ошибок под полями формы с привязкой к атрибуту name инпутов

Методы:
- setValid(isValid: boolean): void - изменяет активность кнопки подтверждения
- getInputValues(): Record<string, string> - возвращает объект с данными из полей формы, где ключ - name инпута, значение - данные введенные пользователем
- setInputValues(data: Record<string, string>): void - принимает объект с данными для заполнения полей формы
- setError(data: { field: string, value: string, validInformation: string }): void - принимает объект с данными для отображения или сокрытия текстов ошибок под полями ввода
- showInputError (field: string, errorMessage: string): void - отображает полученный текст ошибки под указанным полем ввода
- hideInputError (field: string): void - очищает текст ошибки под указанным полем ввода
- close (): void - расширяет родительский метод дополнительно при закрытии очищая поля формы и деактивируя кнопку сохранения
- get form: HTMLElement - геттер для получения элемента формы


#### Класс ModalContactForm
Расширяет класс ModalWithForm. Предназначен для реализации модального окна с формой Контактов покупателя.

Поля класса: 
ContactForm: Record<keyof TFormContact, string>;

#### Класс ModalDeliverForm
Расширяет класс ModalWithForm. Предназначен для реализации модального окна с формой данных доставки  покупателя.

Поля класса: 
FormDeliver: Record<keyof TFormDeliver, string>;


### Слой коммуникации

#### Класс AppApi
Принимает в конструктор экземпляр класса Api и предоставляет методы реализующие взаимодействие с бэкендом сервиса.

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

*Список всех событий, которые могут генерироваться в системе:*\
*События изменения данных (генерируются классами моделями данных)*
- `card:selected` - обработка события , связанного с выбором определенного продукта
- `basket:changed` - изменение в корзине : добавление или удаление товаров
- `modal:changed` - изменение, связанное с модальным окном: открыто, закрыто или изменено.
- `order:changed` - изменение состояния заказа: создание, обновление или отмена заказа.

*События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)*
- `modalItem:open` - открытие модального окна с информацией о продукте
- `basket:open` - открытие модального окна корзины
- `modalContactForm:open` - открытие модального окна с контактами юзера
- `modalDeliverForm:open` - открытие модального окна с данными заказа юзера
- `modalSuccess:open` - открытие модального окна с сообщением что заказ оформлен
- `card:select` - выбор карточки для отображения в модальном окне
- `basket:changed` - изменение данных в корзине
- `modalContactForm:input` - изменение данных в форме с контактами юзера
- `modalDeliverForm:input` - изменение данных в форме с данными доставки юзера
- `modalContactForm:submit` - сохранение данных пользователя в модальном окне контактов пользователя
- `modalDeliverForm:submit` - сохранение данных пользователя в модальном окне данных доставки  пользователя
- `modalContactForm:validation` - событие, сообщающее о необходимости валидации формы контаков пользователя
- `modalDeliverForm:validation` - событие, сообщающее о необходимости валидации формы данных доставки  пользователя
- `card:previewClear` - необходима очистка данных выбранной для показа в модальном окне карточки продукта