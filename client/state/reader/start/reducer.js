/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import union from 'lodash/union';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import forEach from 'lodash/forEach';

/**
 * Internal dependencies
 */
import {
	READER_START_RECOMMENDATIONS_RECEIVE,
	READER_START_RECOMMENDATIONS_REQUEST,
	READER_START_RECOMMENDATIONS_REQUEST_SUCCESS,
	READER_START_RECOMMENDATIONS_REQUEST_FAILURE,
	READER_START_RECOMMENDATION_INTERACTION,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { itemsSchema } from './schema';
import { isValidStateWithSchema } from 'state/utils';

/**
 * Tracks all known list objects, indexed by list ID.
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export function items( state = [], action ) {
	switch ( action.type ) {
		case READER_START_RECOMMENDATIONS_RECEIVE:
			let updatedRecommendations = state;

			forEach( action.recommendations, ( recommendation, key ) => {
				// Check if we already have this rec ID before adding
				if ( find( state, ( existingRecommendation ) => { return existingRecommendation.ID === recommendation.ID; } ) ) {
					return;
				}

				// We want to insert the new recommendation immediately after its parent,
				// if there is one
				let parentPosition = findIndex( state, ( item ) => {
					return item.recommended_site_ID === recommendation.origin_site_ID && item.recommended_post_ID === recommendation.origin_post_ID;
				} );

				if ( parentPosition < 0 ) {
					parentPosition = action.recommendations.length - 1;
				}

				const beforeSlice = updatedRecommendations.slice( 0, parentPosition + 1 );
				const afterSlice = updatedRecommendations.slice( parentPosition );
				updatedRecommendations = beforeSlice.concat( recommendation, afterSlice );
			} );
			return updatedRecommendations;

		case SERIALIZE:
			return state;
		case DESERIALIZE:
			if ( ! isValidStateWithSchema( state, itemsSchema ) ) {
				return [];
			}
			return state;
	}
	return state;
}

/**
 * Returns the updated requests state after an action has been dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isRequestingRecommendations( state = false, action ) {
	switch ( action.type ) {
		case READER_START_RECOMMENDATIONS_REQUEST:
		case READER_START_RECOMMENDATIONS_REQUEST_SUCCESS:
		case READER_START_RECOMMENDATIONS_REQUEST_FAILURE:
			return READER_START_RECOMMENDATIONS_REQUEST === action.type;

		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
}

export function recommendationsInteractedWith( state = [], action ) {
	switch ( action.type ) {
		case READER_START_RECOMMENDATION_INTERACTION:
			return union( state, [ action.recommendationId ] );

		case SERIALIZE:
		case DESERIALIZE:
			return state;
	}

	return state;
}

export default combineReducers( {
	items,
	isRequestingRecommendations,
	recommendationsInteractedWith
} );
