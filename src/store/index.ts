import { configureStore } from "@reduxjs/toolkit";
import localCardsSlice, {ILoaclCard} from './local-cards-slice';
import cardIdSlice from './card-id-slice';

export default configureStore({
  reducer: {
    localCardsSlice,
    cardIdSlice
  },
});

export interface RootState {
  localCardsSlice: {
    localCards: ILoaclCard[];
  };
  cardIdSlice: {
    cardId: string;
  }
}
