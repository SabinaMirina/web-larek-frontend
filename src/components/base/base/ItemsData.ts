import {IItem, IItemsData} from "../../../types/index";
import { IEvents } from "../events";

class ItemsData implements IItemsData {
protected _cards: IItem[];
protected _preview: string | null;
protected _events: IEvents;
}