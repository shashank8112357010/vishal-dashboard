import { setupWorker } from "msw/browser";
import { mockTokenExpired } from "./handlers/_demo";
import { menuList } from "./handlers/_menu";
import { userList } from "./handlers/_user";

// signIn removed - using real backend authentication
const handlers = [userList, mockTokenExpired, menuList];
const worker = setupWorker(...handlers);

export { worker };
