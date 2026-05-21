export class LoginPagePOM {
  constructor(page) {
    this.page = page
    this.usernameInput = page.getByTestId('login-username')
    this.passwordInput = page.getByTestId('login-password')
    this.submitButton = page.getByTestId('login-submit')
    this.errorBlock = page.getByTestId('login-error')
    this.registerLink = page.getByTestId('login-register-link')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async fillAndSubmit({ username, password }) {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectLoaded() {
    await this.usernameInput.waitFor({ state: 'visible' })
  }
}

export class RegisterPagePOM {
  constructor(page) {
    this.page = page
    this.usernameInput = page.getByTestId('register-username')
    this.passwordInput = page.getByTestId('register-password')
    this.confirmInput = page.getByTestId('register-confirm')
    this.submitButton = page.getByTestId('register-submit')
    this.errorBlock = page.getByTestId('register-error')
  }

  async goto() {
    await this.page.goto('/register')
  }

  async fillAndSubmit({ username, password }) {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.confirmInput.fill(password)
    await this.submitButton.click()
  }

  async expectLoaded() {
    await this.usernameInput.waitFor({ state: 'visible' })
  }
}
