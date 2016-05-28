/**
 * External dependencies
 */
import includes from 'lodash/includes';
import find from 'lodash/find';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

const debug = debugModule( 'calypso:reader:start' ); //eslint-disable-line no-unused-vars

/**
 * Returns true if currently requesting recommendations.
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean}        Whether recommendations are being requested
 */
export function isRequestingRecommendations( state ) {
	return !! state.reader.start.isRequestingRecommendations;
}

/**
 * Returns a single recommendation by ID.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Integer}  recommendationId  Recommendation ID
 * @return {Object} Recommendation
 */
export function getRecommendationById( state, recommendationId ) {
	return state.reader.start.items[ recommendationId ];
}

/**
 * Returns recommendations.
 *
 * @param  {Object}  state  Global state tree
 * @return {Object} Recommendations
 */
export function getRecommendations( state ) {
	return state.reader.start.items;
}

/**
 * Returns recommendation IDs.
 *
 * @param  {Object}  state  Global state tree
 * @return {Array} Recommendations IDs
 */
export const getRecommendationIds = createSelector(
	( state ) => Object.keys( state.reader.start.items ).map( Number ),
	( state ) => [ state.reader.start.items ]
);

/**
 * Given a recommendation ID, return a child recommendation if we have one.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Integer}  recommendationId  Recommendation ID
 * @return {Integer} Recommendation ID
 */
export function getChildRecommendationId( state, recommendationId ) {
	const recommendation = getRecommendationById( state, recommendationId );
	debug( recommendation );
	const matchingRecommendation = find( state.reader.start.items, ( item ) => {
		debug( item );
		// @todo will this work for site only recs?
		return recommendation.recommended_site_ID === item.origin_site_ID && recommendation.recommended_post_ID === item.origin_post_ID;
	} );

	if ( ! matchingRecommendation ) {
		return;
	}

	return matchingRecommendation.ID;
}

/**
 * Which recommendations has the user already interacted with?
 *
 * @param  {Object}  state  Global state tree
 * @return {Array} Recommendations
 */
export function getRecommendationsInteractedWith( state ) {
	return state.reader.start.recommendationsInteractedWith;
}

/**
 * Has the user interacted with the specified recommendation?
 *
 * @param  {Object}  state  Global state tree
 * @param {Integer} recommendationId Recommendation ID
 * @return {Boolean} Has user interacted?
 */
export function hasInteractedWithRecommendation( state, recommendationId ) {
	return includes( state.reader.start.recommendationsInteractedWith, recommendationId );
}
