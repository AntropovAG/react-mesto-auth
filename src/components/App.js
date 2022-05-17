import { useEffect, useState } from "react";
import { api } from "../utils/Api";
import Header from './Header';
import Main from "./Main";
import Footer from './Footer';
import EditProfilePopup from "./EditProfilePopup";
import ImagePopup from "./ImagePopup";
import PopupWithConfirm from "./PopupWithConfirm";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";

function App() {

  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [currentCardId, setCurrentCardId] = useState();

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true)
  };

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true)
  };

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true)
  };

  function handleDeleteClick(id) {
    setIsConfirmPopupOpen(true)
    setCurrentCardId({id: id})
    }

  function handleCardDelete() {
    const id = currentCardId.id;
    api.deleteCard(id)
      .then(setCards((state) => state.filter((card) => card.id !== id && card)))
       .catch((err) => console.log(err))
    setIsConfirmPopupOpen(false);
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsConfirmPopupOpen(false);
    setSelectedCard({})
  }

  function handleCardClick(link, name) {
    setSelectedCard({link: link, name: name})
  }

  function handleCardLike(likes, id) {
    const isLiked = likes.some(i => i._id === currentUser.id);
    api.changeLike(id, isLiked)
      .then((newCard) => {
        setCards((state) => state.map((card) => card.id === id ?
        {link: newCard.link, name: newCard.name, id: newCard._id, likes: newCard.likes, cardOwnerId: newCard.owner._id} :
        card))
      })
        .catch((err) => console.log(err))
}

  function handleUpdateUser(name, about) {
    api.editProfile(name, about)
      .then(res => {
        setCurrentUser({avatar: res.avatar, name: res.name, about: res.about, id: res._id});
        setIsEditProfilePopupOpen(false)
      })
        .catch(err => console.log(err))
  }

  function handleAvatarUpdate(avatarLink) {
    console.log(avatarLink)
    api.editAvatar(avatarLink)
      .then(res => {setCurrentUser({...currentUser, avatar: res.avatar,});
      setIsEditAvatarPopupOpen(false)
    })
        .catch(err => console.log(err));
  }

  function handleAddPlaceSubmit({name, link}) {
    api.postCard({name, link})
      .then((newCard => {
        setCards([{link: newCard.link, name: newCard.name, id: newCard._id, likes: newCard.likes, cardOwnerId: newCard.owner._id}, ...cards]);
        setIsAddPlacePopupOpen(false)
      }))
        .catch(err => console.log(err))
  }

  useEffect(() => {
    const closeOnEsc = (e) => {
      if(e.key === 'Escape'){
        closeAllPopups()
      }
    }
    document.addEventListener('keydown', closeOnEsc)
    return () => document.removeEventListener('keydown', closeOnEsc)
  },[])

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([userInfo, cardsInfo]) => {
        const cardsFromServer = cardsInfo.map((card) => {
            return {
              link: card.link,
              name: card.name,
              id: card._id,
              likes: card.likes,
              cardOwnerId: card.owner._id
            }
          })
          setCards(cardsFromServer)
        ;
        setCurrentUser({avatar: userInfo.avatar, name: userInfo.name, about: userInfo.about, id: userInfo._id})
      })
        .catch(err => console.log(err))
  }, [])

  return (
  <>
    <Header/>

    <CurrentUserContext.Provider value={currentUser}>

      <Main onEditAvatar={handleEditAvatarClick}
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            onCardClick={handleCardClick}
            onDeleteClick={handleDeleteClick}
            onCardLike={handleCardLike}
            cards={cards}/>

      <EditProfilePopup isOpen={isEditProfilePopupOpen}
                        onClose={closeAllPopups}
                        onUpdateUser={handleUpdateUser}/>

      <EditAvatarPopup isOpen={isEditAvatarPopupOpen}
                       onClose={closeAllPopups}
                       onUpdateAvatar={handleAvatarUpdate}/>

      <AddPlacePopup isOpen={isAddPlacePopupOpen}
                     onClose={closeAllPopups}
                     onAddPlace={handleAddPlaceSubmit}/>

      <ImagePopup cardAttributes={selectedCard}
                  onClose={closeAllPopups} />

      <PopupWithConfirm isOpen={isConfirmPopupOpen}
                        onClose={closeAllPopups}
                        onDeleteClick={handleCardDelete}/>

    </CurrentUserContext.Provider>

    <Footer/>

  </>

  );
}

export default App;

