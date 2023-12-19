import React, { useEffect, useState } from 'react'
import SurveyList from "./SurveyList";
import NewSurveyForm from "./NewSurveyForm";
import SurveyDetail from "./SurveyDetails"
import EditSurveyForm from "./EditSurveyForm";
import Dashboard from "./Dashboard";
import db from '../firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

function ControlView() {

  const [ formVisibleOnPage, setFormVisibleOnPage ] = useState(false);
  const [ mainSurveyList, setMainSurveyList ] = useState([]); 
  const [ selectedSurvey, setSelectedSurvey ] = useState(null);
  const [ editing, setEditing ] = useState(false); 
  const [ dashboardDisplay, setDashboardDisplay ] = useState(false);
  const [ responseList, setResponseList ] = useState([]);
  const [ error, setError ] = useState(null);

  useEffect(() => { 
    const unSubscribe = onSnapshot(
      collection(db, "tickets"), 
      (collectionSnapshot) => {
       const surveys = [];
       collectionSnapshot.forEach((doc) => {
        surveys.push({
          title: doc.data().title,
          question1: doc.data().question1,
          question2: doc.data().question2,
          question3: doc.data().question3,
          id: doc.id
        });
       });
       setMainSurveyList(surveys);
      }, 
      (error) => {
        setError(error.message);
      }
    );

    return () => unSubscribe();
  }, []);

  const handleClick = () => {
    if (selectedSurvey != null) {
      setFormVisibleOnPage(false);
      setSelectedSurvey(null);
      setEditing(false);
    } else {
        setFormVisibleOnPage(false);
      }
    }

    const handleDashBoardClick = () => {  
      setDashboardDisplay(true);
    }
  

  const handleDeletingSurvey = async (id) => {
    await deleteDoc(doc(db, "surveys", id));
    setSelectedSurvey(null);
  }

  const handleEditClick = () => {
    setEditing(true);
  }

  const handleEditingSurveyInList = async (surveyToEdit) => {
    const surveyRef = doc(db, "surveys", surveyToEdit.id);
    await updateDoc(surveyRef, surveyToEdit);
    setEditing(false);
    setSelectedSurvey(null);
  }

  const handleAddingNewSurveyToList = async (newSurveyData) => {
    const collectionRef = collection(db, "surveys");
    await addDoc(collectionRef, newSurveyData);
    setFormVisibleOnPage(false);
  }

  const handleChangingSelectedSurvey = (id) => {
    const selectedSurvey = mainSurveyList.filter((survey) => survey.id === id)[0];
    setSelectedSurvey(selectedSurvey);
  }

  // const handleResponseList = (id) => {
  //   const responseList = mainSurveyList.filter((survey) => survey.id === id)[0];
  //   setResponseList(responseList);
  // }

  let currentVisibleState = null;
  let buttonText = null;
  if (error) {
    currentVisibleState = <p>There was an error: {error}</p>
  } else if (editing) {
    currentVisibleState = <EditSurveyForm survey = {selectedSurvey} onEditSurvey = {handleEditingSurveyInList} />
    buttonText = "Return to Survey List";
  }
  else if (selectedSurvey != null) {
    currentVisibleState = <SurveyDetail survey = {selectedSurvey} onClickingDelete = {handleDeletingSurvey} onClickingEdit = {handleEditClick} />
    buttonText = "Return to Survey List";
  }
  else if (formVisibleOnPage) {
    currentVisibleState = <NewSurveyForm onNewSurveyCreation={handleAddingNewSurveyToList} />
    buttonText = "Return to Survey List";
  }
  else if (dashboardDisplay) {
    currentVisibleState = //<Dashboard />
    // surveyList={mainSurveyList}
    //onSurveySelection={handleChangingSelectedSurvey}
    buttonText = "Return to Survey List";
  }
  else {
    currentVisibleState = <SurveyList surveyList={mainSurveyList} onSurveySelection={handleChangingSelectedSurvey} />
    buttonText = "Add Survey";
  }

    return (
        <React.Fragment>
          { currentVisibleState}
          {error ? null: <button onClick={handleClick}>{buttonText}</button>}
        </React.Fragment>
    );
    
}

export default ControlView;