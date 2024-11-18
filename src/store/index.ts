import { configureStore } from "@reduxjs/toolkit";
import localCardsSlice, {ILoaclCard} from './local-cards-slice';
import cardIdSlice from './card-id-slice';
import examStateSlice from "./exam-state-slice";

export default configureStore({
  reducer: {
    localCardsSlice,
    cardIdSlice,
    examStateSlice
  },
});

export interface RootState {
  localCardsSlice: {
    localCards: ILoaclCard[];
  };
  cardIdSlice: {
    cardId: string;
  },
  examStateSlice: {
    status: string;
  }
}
