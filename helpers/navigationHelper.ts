import {
    useNavigation as useReactNavigation,
    ParamListBase,
  } from "@react-navigation/native";
  import { NavigationPropsWithReplace } from "../types/navigation";
  
  /**
   * Custom navigation hook with pre-defined typings
   * @returns A typed navigation object
   */
  export function useNavigation() {
    return useReactNavigation<NavigationPropsWithReplace<ParamListBase>>();
  }