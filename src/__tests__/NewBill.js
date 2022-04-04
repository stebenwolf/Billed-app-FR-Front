/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


// added by myself
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {waitFor} from "@testing-library/dom"
import {fireEvent} from "@testing-library/dom"
import mockStore from "../__mocks__/store"
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })
    test("Then mail icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      //to-do write expect expression
      expect(windowIcon.className).toEqual("active-icon")

    })
    test("Then we should be able to upload a ticket with a correct extension", () => {

      const newbill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      const filedata = {
        file: "image.png"
      };

      const file = screen.getAllByTestId("file")[0]

      const changefile = jest.fn((e)=> newbill.handleChangeFile(e))
      file.addEventListener("change", changefile)
      fireEvent.change(file, {target: { files: [new File(["image"], filedata.file)], testfilevalid: "image.png"}});
      expect(changefile).toHaveBeenCalled()
      expect(newbill.validType).toBeGreaterThanOrEqual(0)
    })
    test("Then we shouldn't be able to upload a ticket with an incorrect extension", () => {

      const newbill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      const filedata = {
        file: "image.psdfng"
      };

      const file = screen.getAllByTestId("file")[0]

      const changefile = jest.fn((e)=> newbill.handleChangeFile(e))
      file.addEventListener("change", changefile)
      fireEvent.change(file, {target: { files: [new File(["image"], filedata.file)], testfilevalid: "image.png"}});
      expect(changefile).toHaveBeenCalled()
      expect(newbill.validType).toBeLessThan(0)
    })
    test("Then we should be able to submit a ticket", () => {
      /* const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill) */

      const newbill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })


      const btn = screen.getAllByText("Envoyer")
      expect(btn).toBeTruthy()

      const submitBill = jest.fn((e)=> newbill.handleSubmit(e))
      btn[0].addEventListener("click", submitBill)
      userEvent.click(btn[0])
      expect(submitBill).toHaveBeenCalled()/* 
      fireEvent.click(btn[0], submitBill)
      expect(submitBill).toHaveBeenCalled() */

      /* file.addEventListener("change", changefile)
      fireEvent.change(file, {target: { files: [new File(["image"], filedata.file)], testfilevalid: "image.png"}});
      expect(changefile).toHaveBeenCalled()
      expect(newbill.validType).toBeLessThan(0) */
    })
  })
})