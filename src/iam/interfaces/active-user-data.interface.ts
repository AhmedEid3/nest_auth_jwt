export interface ActiveUserData {
  /**
   * The "subject" of token. The value of this property is user ID
   * that granted this token.
   */
  sub: number;

  /**
   * The subject's (user) username.
   */
  username: string;

  refreshToken?: string;
}
