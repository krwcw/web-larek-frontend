import './scss/styles.scss';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Basket } from './components/Basket';
import { Card } from './components/Card';
import { ContactsForm } from './components/ContactsForm';
import { Modal } from './components/base/Modal';
import { OrderForm } from './components/OrderForm';
import { ProductPreview } from './components/ProductPreview';
import { IBasketItem, IErrorResponse, IOrderResponse, IProduct, IProductsResponse } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureAllElements, ensureElement } from './utils/utils';
import { SuccessMessage } from './components/SuccessMessage';

const events = new EventEmitter();
const api = new Api(API_URL);

let catalog: IProduct[] = [];
let basketItems: IBasketItem[] = [];

const gallery = ensureElement<HTMLElement>('.gallery');

const modals = ensureAllElements<HTMLElement>('.modal');
const previewModal = new Modal(modals[0]);
const basketModal = new Modal(modals[1]); 
const orderModal = new Modal(modals[2]);
const successModal = new Modal(modals[4]);

const basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
const basketList = ensureElement<HTMLElement>('.basket');
const basketButton = ensureElement<HTMLButtonElement>('.header__basket');
const basket = new Basket(basketList, events)



api.get('/product').then((data: IProductsResponse) => {
    catalog = data.items.map((item: IProduct) => ({...item, image: CDN_URL + item.image}));
    catalog.forEach(product => {
        const template = ensureElement<HTMLTemplateElement>('#card-catalog')
        const cardElement = cloneTemplate(template);
        const card = new Card(cardElement, events);
        card.render(product);
        gallery.appendChild(cardElement);

    })
})

events.on('card:click', (data: { productId: number }) => {
    const product = catalog.find(p => p.id === data.productId);
    if (product) {
        const template = ensureElement<HTMLTemplateElement>('#card-preview');
        const previewContent = cloneTemplate(template);
        
        const isInBasket = basketItems.some(item => item.product.id === product.id);
        const preview = new ProductPreview(previewContent);
        preview.render(product, isInBasket);
        
        preview.setButtonHandler((isAdding: boolean) => {
            if (isAdding) {
                events.emit('basket:add', { productId: product.id });
            } else {
                events.emit('basket:remove', { productId: product.id });
            }
            previewModal.close();
        });
        
        previewModal.setContent(previewContent).open();
    }
});

events.on('basket:add', (data: { productId: number }) => {
    const product = catalog.find(p => p.id === data.productId);
    if (product) {
        basketItems.push({
            product: product,
            index: basketItems.length + 1
        });

        const total = basketItems.reduce((sum, item) => sum + item.product.price, 0);

        basket.render(basketItems, total)
        basketCounter.textContent = `${basketItems.length}`;
        previewModal.close()
    }
})

events.on('basket:remove', (data: { productId: number }) => {
    basketItems = basketItems.filter(item => item.product.id !== data.productId);
    const total = basketItems.reduce((sum, item) => sum + item.product.price, 0);
    basket.render(basketItems, total);
    basketCounter.textContent = `${basketItems.length}`;
});

events.on('order:open', () => {
    const template = ensureElement<HTMLTemplateElement>('#order');
    const orderContent = cloneTemplate(template);
    
    const orderForm = new OrderForm(orderContent);
    orderForm.render();
    
    orderForm.setSubmitHandler((event) => {
    event.preventDefault();
    const orderValues = orderForm.getValues();
    
    const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
    const contactsContent = cloneTemplate(contactsTemplate);
    
    const contactsForm = new ContactsForm(contactsContent);
    contactsForm.render();
    
    contactsForm.setSubmitHandler((event) => {
        event.preventDefault();
        const contactsValues = contactsForm.getValues();
        
        const orderData = {
            payment: orderValues.payment,
            address: orderValues.address,
            email: contactsValues.email,
            phone: contactsValues.phone,
            total: basketItems.reduce((sum, item) => sum + item.product.price, 0),
            items: basketItems.map(item => item.product.id)
        };
        
        api.post('/order', orderData)
            .then((response: IOrderResponse) => {
                events.emit('order:success', { total: response.total });
            })
            .catch((error: IErrorResponse) => {
                console.error('Order error:', error.error);
            });
    });
    
    orderModal.setContent(contactsContent);
});
    
    orderModal.setContent(orderContent).open();
    basketModal.close();
});

events.on('order:success', (data: { total: number; onClose: () => void }) => {
    const successTemplate = ensureElement<HTMLTemplateElement>('#success');
    const successContent = cloneTemplate(successTemplate);
    const successMessage = new SuccessMessage(successContent);
    
    successMessage.render({ total: data.total });
    successModal.setContent(successContent).open();
    orderModal.close();

    basketItems = [];
    basketCounter.textContent = '0';

    successMessage.setCloseHandler(() => {
        successModal.close();
    });
});

basketButton.addEventListener('click', () => {
    const total = basketItems.reduce((sum, item) => sum + item.product.price, 0);
    basket.render(basketItems, total);
    basketModal.setContent(basketList).open();
})

