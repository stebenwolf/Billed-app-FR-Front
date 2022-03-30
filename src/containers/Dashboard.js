import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'
import Logout from "./Logout.js"

export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {
      let selectCondition

      // in jest environment
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      }
      /* istanbul ignore next */
      else {
        // in prod environment
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) &&
          ![...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : []
}

export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
  firstAndLastNames.split('.')[1] : firstAndLastNames

  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}

export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending"
    case 2:
      return "accepted"
    case 3:
      return "refused"
  }
}

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    this.isOpen = [0,0,0]
    // dans le dashboard, a chaque fois qu'on clique sur la flèche, on appelle la fonction "handleShowTickets"
    // cette fonction gère l'affichage des tickets, et on en trouve la définition plus bas 
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))
    new Logout({ localStorage, onNavigate })
  }

  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url")
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8)
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`)
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
  }


  // cette méthode est associée à chaque ticket, via la méthode plus bas (handleShowTickets)
  
  handleEditTicket(e, bill, bills,isClicked) {
    
    /* let isClicked = 0 */
    if (isClicked === undefined) isClicked = 0
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id
    // on retrouve cette histoire de compteur. Si le compteur est pair au moment où l'on clique sur le ticket, 
    
    let color = $(`#open-bill${bill.id}`).attr("style")
    console.log("color: ",color)
    console.log("color == background: rgb(42, 43, 53);", color=="background: rgb(42, 43, 53);")
    console.log("color == background: rgb(13, 90, 229);", color == "background: rgb(13, 90, 229);")


    

    /*  if (isClicked == 1) { */
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })
      
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })
      $('.dashboard-right-container div').html(DashboardFormUI(bill))
      $('.vertical-navbar').css({ height: '150vh' })
      color = $(`#open-bill${bill.id}`).attr("style")
      console.log("color isClicked0: ",color)  
    /* }  */

    if(isClicked == 1) {
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })
      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `)
      $('.vertical-navbar').css({ height: '120vh' })
      color = $(`#open-bill${bill.id}`).attr("style")
      console.log("color 1: ",color)
          
      $(`#open-bill${bill.id}`).click(() => color = "background: rgb(13, 90, 229);")
    }
    
    $('#icon-eye-d').click(this.handleClickIconEye)
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill))
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill))
  }

  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  // cette méthode gère l'affichage des tickets (liste déroulante, sur le côté). elle est appelée à chaque clic sur la flèche dans le menu vertical (en attente, validé, refusé)
  // autre problème rencontré : lorsqu'on clique sur une flèche puis une autre, la seconde fois n'est pas active, il faut cliquer deux fois pour réactiver le fonctionnement du pliage/dépliage
  handleShowTickets(e, bills, index) {
    // si la variable "counter" n'existe pas//est indéfinie, on l'initialise et elle est égale à 0. En fait elle correspond au nombre de clics effectués sur la flèche, et il y en a maximum 3 (1 par catégorie de tickets).
    //console.log("the counter :", this.counter, " et the index: ", index)
    if (this.counter === undefined || this.index !== index) this.counter = 0
    // la variable index correspond à la catégorie: 1 pour en attente, 2 pour validé, 3 pour refusé
    if (this.index === undefined || this.index !== index) this.index = index
    // si le nombre de clic est pair au moment où l'on clique sur la flèche, alors on affiche les notes de frais
    //if (this.counter % 2 === 0) {
    if (this.isOpen[index-1] === 0) {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)'})
      $(`#status-bills-container${this.index}`)
        .html(cards(filteredBills(bills, getStatus(this.index))))
      this.counter ++
      this.isOpen[index-1] = 1
    // sinon, on masque les tickets
    } else {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)'})
      $(`#status-bills-container${this.index}`)
        .html("")
      this.counter ++
      this.isOpen[index-1] = 0
    }

    // pour chacun des tickets de la liste, on a un eventlistener au clic.
    // mais on remarque deux choses: la première, c'est que cette fonction est en dehors des conditions ci-dessus, ce qui signifie qu'elle va s'adresser à tous les tickets ?
    // la deuxième chose, c'est que bills est fixe, il semble inutile de créer à chaque clic sur une flèche un event listener sur TOUS les tickets. On pourrait en créer un uniquement sur les tickets de la catégorie choisie ?
    bills.forEach(bill => {
      if (bill.openTicket === undefined || this.index !== index) bill.openTicket = 0
      
      $(`#open-bill${bill.id}`).click((e) => {
        this.handleEditTicket(e, bill, bills)
      })
    })

    return bills
  }

  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
        .map(doc => ({
          id: doc.id,
          ...doc,
          date: doc.date,
          status: doc.status
        }))
        return bills
      })
      .catch(error => {
        throw error;
      })
    }
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
    return this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: bill.id})
      .then(bill => bill)
      .catch(console.log)
    }
  }
}
