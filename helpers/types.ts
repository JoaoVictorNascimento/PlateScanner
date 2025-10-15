import { NavigationProp, ParamListBase } from "@react-navigation/native";

export interface NavigationPropsWithReplace<T extends ParamListBase>
  extends NavigationProp<T> {
  replace: (name: keyof T, params?: object) => void;
}