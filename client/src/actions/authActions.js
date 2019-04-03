import { GET_ERRORS, SET_CURRENT_USER }from './Types'
import axios from 'axios'
import jwt_decode from 'jwt-decode'
import setAuthToken from '../utils/setAuthToken'


//Register
export const registerUser = (userData, history) => dispatch => {
	axios.post('/api/users/register', userData)
		.then(res => history.push('/login'))
		.catch(err => 
			dispatch({
				type: GET_ERRORS,
				payload: err.response.data
			})	
		)
}

//Login get user token
export const loginUser = (userData) => dispatch => {
	axios.post('/api/users/login', userData)
		.then(res => {
			//save to local storage
			const { token } = res.data
			//set token to ls
			localStorage.setItem('jwtToken', token)
			//Set token Auth header
			setAuthToken(token)
			//Decode token to get user data
			const decoded = jwt_decode(token);
			//setcurrent user
			dispatch(setCurrentUser(decoded))
		})
		.catch(err => dispatch({
			type: GET_ERRORS,
			payload: err.response.data
		}))
}


//set logged in user
export const setCurrentUser = decoded => {
	return {
		type: SET_CURRENT_USER,
		payload: decoded
	}
}

//Log user out
export const logoutUser = () => dispatch => {
	//Remove token from localstorage
	localStorage.removeItem('jwtToken');
	//Remove auth header for future requests
	setAuthToken(false);
	//set current user to {} which will set isAuthenticated to false
	dispatch(setCurrentUser({}));
}