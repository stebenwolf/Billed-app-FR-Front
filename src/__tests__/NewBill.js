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
import { resolve } from "path";
import { bills } from "../fixtures/bills.js";
import { post } from "jquery";

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

      jest.spyOn(console, "error").mockImplementation(() => {})

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
  })
})
describe("As an employee", () => {
  beforeEach(() => {
    let newBill
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })// Set localStorage
    window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))// Set user as Employee in localStorage
    const html = NewBillUI()
    document.body.innerHTML = html
    newBill = new NewBill({
      document,
      onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
      store: null,
      localStorage: window.localStorage
    })     
  })
  describe("When on newbill page", () => { 
    test("Then we should be able to submit a ticket", () => {
      
      const newBill = new NewBill({
        document,
        onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
        store: null,
        localStorage: window.localStorage
      })     
      
      const form = screen.getByTestId("form-new-bill")
      expect(form).toBeTruthy()

      const submitBill = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener("submit",submitBill)
      fireEvent.submit(form)
      expect(submitBill).toHaveBeenCalled()
      
    })
  })
})


// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBill", () => {
    test("New bill information are sent to mock API POST", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })// Set localStorage
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))// Set user as Employee in localStorage

      const newbill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      
      newbill.updateBill = jest.fn()
      const handleSubmit = jest.fn((e) => newbill.handleSubmit(e))
      const form = screen.getByTestId("form-new-bill")
      form.addEventListener("submit",handleSubmit)
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()
      expect(newbill.updateBill).toHaveBeenCalled()
      

      /* const postSpy = jest.spyOn(mockStore, "post")
      await mockStore.post(newBill)
      expect(postSpy).toHaveBeenCalled()
      expect(postSpy).toHaveBeenCalledWith(newBill) */
      
    })
    test("Then an error triggered during POST generates a console error 500", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {})
      
      jest.spyOn(mockStore, "bills")

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      document.body.innerHTML = `<div id="root"></div>`
      router()
   
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({document,  onNavigate, store: mockStore, localStorage: window.localStorage})
   
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update : () =>  {
            return Promise.reject(new Error('Erreur 500'))
          }
        }
      })
      
      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener('submit', handleSubmit)     
      fireEvent.submit(form)
      await new Promise(process.nextTick)
      expect(console.error).toBeCalled()

      
    })
  })
})
