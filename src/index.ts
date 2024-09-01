import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { IApi, TOrder, PaymentCategory } from './types';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/base/common/Modal';
import { Page } from './components/base/Page';
import {
	AppState,
	CatalogItemEvent,
	ItemCatalog,
} from './components/base/AppData';
import { FormEmailPhone, FormPaymentAddress } from './components/base/Form';
import { AppApi } from './components/base/AppApi';
import { Api } from './components/base/base/Api';
import { EventEmitter } from './components/base/base/EventEmitter';
import { BasketView } from './components/base/Basket';
import { CardBasket, CardModal, ItemsGallery } from './components/base/Item';
import { IOrderSuccess, OrderSuccess } from './components/base/Success';

const events = new EventEmitter();
const baseApi: IApi = new Api(API_URL);
const api = new AppApi(CDN_URL, baseApi);

// Чтобы мониторить все события, для отладки
events.onAll((event) => {
	console.log(event.eventName, event.data);
});

// Все шаблоны
const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardTemplateModal = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardTemplateBasket = ensureElement<HTMLTemplateElement>('#card-basket');
const orderFormTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsFormTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderSuccessTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения  appData
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(document.querySelector('.modal'), events);
const basket = new BasketView(cloneTemplate(basketTemplate), events);

// бизнес-логика
// Получаем карточки с сервера
api
	.loadItems()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});

//вывод карточек на страницу
events.on<CatalogItemEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new ItemsGallery(cloneTemplate(cardTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			price: item.price,
			category: item.category,
		});
	});
});

// выбор карточки
events.on('card:select', (item: ItemCatalog) => {
	appData.setPreview(item);
});

//открытие выбранной карточки в модальном окне
events.on('preview:changed', (item: ItemCatalog) => {
	const showItem = (item: ItemCatalog) => {
		const card = new CardModal(cloneTemplate(cardTemplateModal), {
			onClick: () => events.emit('basket:open', item),
		});
		modal.render({
			content: card.render({
				title: item.title,
				image: item.image,
				price: item.price,
				category: item.category,
				description: item.description,
			}),
		});
	};

	if (item) {
		api
			.getLoadItem(item.id)
			.then((result) => {
				console.log('ok', result);
				item.description = result.description;
				(item.title = result.title),
					(item.image = result.image),
					(item.price = result.price),
					(item.category = result.category),
					(item.description = result.description),
					showItem(item);
			})
			.catch((err) => {
				console.error(err);
			});
	} else {
		modal.close();
	}
});

// открытие корзины и добавление в нее элемента
events.on('basket:open', (item: ItemCatalog) => {
	if (item) {
		// Проверяем, если товар уже в заказе
		if (appData.order.items.includes(item.id)) {
			return;
		}

		// Приводим item.price к числу и проверяем, если цена товара равна 0
		const price = Number(item.price);
		if (price === 0) {
			return; // Если цена товара равна 0, выходим из функции
		}

		appData.toggleOrderedItem(item.id, true);
		api
			.getLoadItem(item.id)
			.then((result) => {
				console.log('ok', result);
				item.title = result.title;
				item.price = result.price;

				// Получаем текущий индекс для нового товара
				const itemIndex = appData.order.items.length;

				// Создаем и рендерим карточку товара после добавления в заказ
				const contentCard = new CardBasket(cloneTemplate(cardTemplateBasket), {
					onClick: () => events.emit('item:deleted-from-basket', item),
				});
				contentCard.setItemId(item.id); // Устанавливаем ID для карточки
				contentCard.index = itemIndex; // Устанавливаем индекс для карточки
				const renderedCard = contentCard.render({
					title: item.title,
					price: item.price,
				});

				// Добавляем товар в корзину
				basket.renderI({ content: renderedCard });

				// Обновляем итоговую сумму заказа после добавления товара
				const basketPrice = appData.getTotal();
				basket.totalNumber = basketPrice; // Обновляем отображение общей суммы

				// Обновляем счётчик товаров
				page.counter = appData.getOrderItemCount();

				// Рендерим модальное окно с содержимым корзины
				modal.render({
					content: basket.getContainer(), // Используем метод getContainer() для получения контейнера
				});
			})
			.catch((err) => {
				console.error(err);
			});
	} else {
		modal.close();
	}
});

//Открытие корзины из иконки корзины
events.on('basket:openn', () => {
	modal.render({
		content: basket.getContainer(), // Используем метод getContainer() для получения контейнера с уже добавленными карточками
	});
	// Обновляем состояние кнопки
	basket.updateButtonState();
});

//Удаление карточки товара из корзины
events.on('item:deleted-from-basket', (item: ItemCatalog) => {
	appData.toggleOrderedItem(item.id, false);
	// находим элемент по id
	const cardToRemove = Array.from(basket.getItems()).find((child) => {
		return (child as HTMLElement).getAttribute('data-id') === item.id;
	});
	//удаление карточки
	if (cardToRemove) {
		cardToRemove.remove();
	}
	// Пересчитываем индексы оставшихся товаров
	const remainingItems = Array.from(basket.getItems());
	remainingItems.forEach((child, index) => {
		const cardElement = child as HTMLElement;
		const indexElement = cardElement.querySelector('.basket__item-index');
		if (indexElement) {
			indexElement.textContent = String(index + 1); // Обновляем индекс начиная с 1
		}
	});

	// Обновляем итоговую сумму заказа после удаления товара
	const basketPrice = appData.getTotal();
	basket.totalNumber = basketPrice; // Обновляем отображение общей суммы

	// Обновляем состояние кнопки
	basket.updateButtonState();
	// Обновляем счётчик товаров
	page.counter = appData.getOrderItemCount();
});

// Реализация события открытия формы и добавления данных в order
events.on('order:open', () => {
	const formContact = new FormPaymentAddress(
		cloneTemplate(orderFormTemplate),
		events,
		{
			onClick: () => {
				const formData = formContact.getFormData();
				events.emit('order:payment-address-form-fulfilled', formData);
				appData.updateOrderDeliver(formData.payment, formData.address);
			},
		}
	);

	const initialState = {
		valid: false,
		errors: [] as string[],
		payment: PaymentCategory.online,
		address: '',
	};

	modal.render({
		content: formContact.render(initialState),
	});
});

// Форма email и телефон
events.on('order:payment-address-form-fulfilled', () => {
	const formOrder = new FormEmailPhone(
		cloneTemplate(contactsFormTemplate),
		events,
		{
			onClick: () => {
				const emailPhoneData = formOrder.getFormData();
				appData.updateOrderContacts(emailPhoneData.email, emailPhoneData.phone); // Обновляем контактную информацию заказа

				try {
					// отправляем заказ на сервер
					api.postOrder(appData.getOrderItems() as TOrder);
					// Эмитим событие успешного оформления заказа
					events.emit('order:fullfilled');
					// Очищаем корзину и сбрасываем отображаемую сумму только после успешной отправки заказа
					appData.clearBasket();
					basket.clearItems();
					basket.totalNumber = 0;
					page.counter = 0;
				} catch (error) {
					// Обработка ошибки отправки заказа
					console.error('Failed to submit order:', error);
				}
			},
		}
	);

	// Создаем объект начального состояния формы
	const initialState = {
		valid: false,
		errors: [] as string[],
		email: '',
		phone: '',
	};

	// Рендерим форму и отображаем ее в модальном окне
	modal.render({
		content: formOrder.render(initialState), // Передаем начальное состояние формы
	});
});

// Выводим сообщение об успешном заказе
events.on('order:fullfilled', () => {
	// Получаем итоговую сумму из AppState
	const totalPrice = appData.order.total;

	// Создаем объект IOrdersuccess с включением итоговой суммы
	const orderSuccess: IOrderSuccess = {
		title: 'Заказ успешно оформлен',
		totalAmount: `Списано ${totalPrice} синапсов`,
	};

	// Создаем и рендерим Ordersuccess
	const success = new OrderSuccess(
		cloneTemplate(orderSuccessTemplate),
		events,
		orderSuccess
	);
	modal.render({ content: success.content });
});

events.on('order:success', () => {
	modal.close();
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});
