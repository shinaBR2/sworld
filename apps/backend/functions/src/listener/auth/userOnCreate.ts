import { functionAuth } from "../../singleton";

const userOnCreate = functionAuth.user().onCreate((user) => {
  /**
   * TODO
   */
  // const { email } = user;
});

export { userOnCreate };
