import { useContext } from "react";
import NotificationsContext from "./notifications-context";

export default function useNotifications(){
    const ctx = useContext(NotificationsContext);
    if(!ctx){
        throw ("useNotifications should use inside NotificationsProvider")
    }
    return ctx;
}