import JsSHA from 'jssha'

export const EXPRESS_URL = 'http://localhost:3000' // USE LOCAL EXPRESS
//export const EXPRESS_URL = 'http://155.4.159.231:3000' // USE HOST EXPRESS

function hashMyPassword (password) {
  const hashObj = new JsSHA('SHA-512', 'TEXT', { numRounds: 1 })
  hashObj.update(password)
  const hash = hashObj.getHash('HEX')
  return hash
}

export async function authenticate () {
  return fetch(EXPRESS_URL + '/authenticate', { 
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  }).then((response) => {
    if (!response.ok) {
      return false
    }
    return true
  }).catch(() => {
    return false
  }) 
}

export async function checkAdminStatus () {
  const authPromise = fetch(EXPRESS_URL + '/admin', { 
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  }).then((response) => {
    if (!response.ok) {
      return false
    }
    return true
  }).catch(() => {
    return false
  }) 

  return authPromise 
}

export async function login (email, password) {
  //const hashedPassword = hashMyPassword(password)

  const loginPromise = fetch(EXPRESS_URL + '/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email, password: password }),
    credentials: 'include'
  }).then((response) => {
    if (!response.ok) {
      return false
    } else {
      return true
    }
  }).catch(() => {
    return false
  })
  return loginPromise
}

export async function logout () {
  const logoutPromise = fetch(EXPRESS_URL + '/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  }).then((response) => {
    if (!response.ok) {
      return false
    } else {
      return true
    }
  }).catch(() => {
    return false
  })
  return logoutPromise
}

export async function register (username, password) {
  const hashedPassword = hashMyPassword(password)

  fetch(EXPRESS_URL + '/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: username, password: hashedPassword })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      } else {
        console.log('Registering account')
        return true
      }
    })
    .catch(() => {
      return false
    })
}

export async function getAllListings (searchword, destinationsArray, categoryArray, articleArray) {
  const getAllListingsPromise = fetch(EXPRESS_URL + '/getAllListings/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ searchword: searchword, destinations: destinationsArray, categories: categoryArray, articles: articleArray })

  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      } else {
        return response.json()
      }
    })
    .catch(err => {
      console.error('There has been a problem with your fetch operation:', err)
    })

  return getAllListingsPromise
}

export async function profile () {
  const profilePromise = fetch(EXPRESS_URL + '/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      } else {
        return response.json()
      }
    })
    .catch(err => {
      console.error('There has been a problem with your fetch operation:', err)
    })
  return profilePromise
}

export async function getNotifications () {
  const promise = await fetch(EXPRESS_URL + '/notification', {
    method: 'GET',
    credentials: 'include'
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      } else {
        return response.json()
      }
    })
    .catch(err => {
      console.error('There has been a problem with your fetch operation:', err)
    })
  return promise
}

export async function postNotification (type, user) {
  const data = { 
    date: '',
    type: type,
    toUser: user,
    fromUser: '',
    seen: false
  }
  const promise = await fetch(EXPRESS_URL + '/notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include'
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      } else {
        return response
      }
    })
    .catch(err => {
      console.error('There has been a problem with your fetch operation:', err)
    })
  return promise
}

export async function setNotificationsToSeen () {
  const promise = await fetch(EXPRESS_URL + '/notification', {
    method: 'PATCH',
    credentials: 'include'
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      } else {
        return response
      }
    })
    .catch(err => {
      console.error('There has been a problem with your fetch operation:', err)
    })
  return promise
}

export function getArticles () {
  const promise = fetch(EXPRESS_URL + '/articles', {
    method: 'GET',
    credentials: 'include'
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      return (data)
    })
    .catch(() => {
      return false
    })
  return promise
}

export async function updateProfile (accountName, description, adress, city, billingName, billingBox, billingAdress, orgNumber, email, phone, logo) {
  console.log('updating profile')
  const data = new FormData()
  data.append('accountInfo', JSON.stringify({ 
    accountName: accountName,
    description: description,
    adress: adress,
    city: city,
    billingName: billingName,
    billingBox: billingBox,
    billingAdress: billingAdress,
    orgNumber: orgNumber, 
    email: email,
    phone: phone
  }))
  data.append('file', logo)
  const updateProfilePromise = fetch(EXPRESS_URL + '/updateProfile', {
    method: 'POST',
    credentials: 'include',
    body: data 
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      } else {
        console.log('Update ok')
        return response
      }
    })
    .catch(err => {
      console.error('There has been a problem with your fetch operation:', err)
    })

  return updateProfilePromise
}

export async function getUserProfile (accountname) {
  const userProfilePromise = fetch(EXPRESS_URL + '/members/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accountname: accountname })
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      return (data)
    })
    .catch(() => {
      return false
    })
  return userProfilePromise
}

export async function getAllMembers (searchWord) {
  const promise = await fetch(EXPRESS_URL + '/getAllMembers2/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok')
    } else {
      return response.json()
    }
  }).catch(err => {
    console.error('There has been a problem with your fetch operation:', err)
  })
  console.log(promise)

  let searchword = searchWord.split(' ')
  searchword = searchword.filter(function (value, index, arr) {
    return value !== ''
  })

  const allMembersArray = new Map()
  const adminMembersArray = new Map()

  promise.forEach(user => {
    const name = user.profile.accountName
    let foundSearchword = true
    if (searchword.length !== 0) {
      for (let i = 0; i < searchword.length; i++) {
        if (!name.match(new RegExp(searchword[i], 'i'))) {
          foundSearchword = false
          break
        } 
      }
      if (!foundSearchword) {
        return
      }
    }
    if (user.is_admin) {
      if (!adminMembersArray.has('Admin')) {
        adminMembersArray.set('Admin', [])
      }
      adminMembersArray.get('Admin').push(user.profile)
    } else {
      if (!allMembersArray.has(user.profile.city)) {
        allMembersArray.set(user.profile.city, [])
      }
      allMembersArray.get(user.profile.city).push(user.profile)
    }
  })
  
  //Sort alphabetically by swedish.

  for (const value of allMembersArray.values()) {
    value.sort((a, b) => a.accountName.localeCompare(b.accountName))
  }
  console.log(allMembersArray)
  const sortedMap = new Map([...allMembersArray].sort((a, b) => String(a[0]).localeCompare(b[0], 'sv')))
  const finishMap = new Map([...adminMembersArray, ...sortedMap])

  return { allMembers: finishMap }
}

/* Routes using cc-node */

export function getPurchases () {
  const promise = fetch(EXPRESS_URL + '/purchases', {
    method: 'GET',
    credentials: 'include'
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      return (data)
    })
    .catch(() => {
      return false
    })
  return promise
}

export function getRequests () {
  const promise = fetch(EXPRESS_URL + '/requests', {
    method: 'GET',
    credentials: 'include'
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      return (data)
    })
    .catch(() => {
      return false
    })
  return promise
}

export function cancelRequest (id) {
  const data = { uuid: id }
  const promise = fetch(EXPRESS_URL + '/cancelrequest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include'
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      return (data)
    })
    .catch(() => {
      return false
    })
  return promise
}

export function acceptRequest (id) {
  const data = { uuid: id }
  const promise = fetch(EXPRESS_URL + '/acceptrequest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include'
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      return (data)
    })
    .catch(() => {
      return false
    })
  return promise
}

export async function getSaldo () {
  const promise = await fetch(EXPRESS_URL + '/saldo', {
    method: 'GET',
    credentials: 'include'
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      return (data)
    })
    .catch(() => {
      return null
    })
  console.log(promise)
  if (promise) {
    return promise.completed.balance
  } else {
    return null
  }
}

export async function uploadArticle (data) {
  const promise = await fetch(EXPRESS_URL + '/upload/article', { 
    method: 'POST',
    credentials: 'include',
    body: data // This is your file object
  }).then((res) => {
    return res
  }).then((success) => {
    return success
  }).catch(error => {
    return error
  }) 
  
  return promise
}

export async function deletePost (id, imgIDs) {
  const promise = await fetch(EXPRESS_URL + '/article/remove/' + id, {
    method: 'POST',
    body: JSON.stringify({ imgIDs: imgIDs }),
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  }).then((res) => {
    return res
  }).then((success) => {
    return success
  }).catch(error => {
    return error
  }) 

  return promise
}

export async function deleteCart (id) {
  const promise = await fetch(EXPRESS_URL + '/cart/remove/item/edit/' + id, {
    method: 'POST',
    credentials: 'include'
  }).then((res) => {
    return res
  }).then((success) => {
    return success
  }).catch(error => {
    return error
  }) 

  return promise
}

export async function getImg (filename) {
  const promise = await fetch(EXPRESS_URL + '/image/' + filename, {
    method: 'GET',
    credentials: 'include'
  }).then((res) => {
    return res
  }).then((success) => {
    return success
  }).catch(error => {
    return error
  }) 

  return promise
}

export async function getCart () {
  const promise = await fetch(EXPRESS_URL + '/cart', { 
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  }).then((res) => {
    return res.json()
  }).then((success) => {
    return success
  }).catch((error) => {
    return error
  })
  return promise
}

export async function createTransactions (cart) {
  cart.forEach(element => {
    fetch(EXPRESS_URL + '/createrequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(element),
      credentials: 'include'
    })  
  })
}

export async function getAvailableBalance () {
  const saldo = await getSaldo()
  const promise = await fetch(EXPRESS_URL + '/minlimit', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      } else {
        return response.json()
      }
    })
    .catch(err => {
      console.error('There has been a problem with your fetch operation:', err)
    })
  
  console.log(saldo - promise.min_limit)
  return saldo - promise.min_limit
}
