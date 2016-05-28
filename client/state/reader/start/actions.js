/**
 * External dependencies
 */
import map from 'lodash/map';
import omit from 'lodash/omit';
import property from 'lodash/property';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	READER_START_RECOMMENDATIONS_RECEIVE,
	READER_START_RECOMMENDATIONS_REQUEST,
	READER_START_RECOMMENDATIONS_REQUEST_SUCCESS,
	READER_START_RECOMMENDATIONS_REQUEST_FAILURE,
	READER_START_RECOMMENDATION_INTERACTION
} from 'state/action-types';
import { updateSites } from 'state/reader/sites/actions';
import { receivePosts } from 'state/reader/posts/actions';

/**
 * Returns an action object to signal that recommendation objects have been received.
 *
 * @param  {Array}  recommendations Recommendations received
 * @return {Object} Action object
 */
export function receiveRecommendations( recommendations ) {
	return {
		type: READER_START_RECOMMENDATIONS_RECEIVE,
		recommendations
	};
}

/**
 * Returns an action object to signal that a recommendation has been interacted with.
 *
 * @param  {Integer} recommendationId Recommendation ID
 * @return {Object} Action object
 */
export function recordRecommendationInteraction( recommendationId ) {
	return {
		type: READER_START_RECOMMENDATION_INTERACTION,
		recommendationId
	};
}

/**
 * Triggers a network request to fetch recommendations.
 *
 * @param  {Integer} originSiteId Origin site ID
 * @param  {Integer} originPostId Origin post ID
 * @param  {Integer} limit Maximum number of results to return
 * @return {Function}        Action thunk
 */
export function requestRecommendations( originSiteId, originPostId, limit ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_START_RECOMMENDATIONS_REQUEST,
		} );

		const query = {
			meta: 'site,post',
			origin_site_ID: originSiteId,
			origin_post_ID: originPostId,
			number: limit
		};

		return wpcom.undocumented().readRecommendationsStart( query )
			.then( ( data ) => {
				// Collect sites and posts from meta, and receive them separately
				const sites = map( data.recommendations, property( 'meta.data.site' ) );
				const posts = map( data.recommendations, property( 'meta.data.post' ) );
				dispatch( updateSites( sites ) );
				dispatch( receivePosts( posts ) );

				// Trim meta off before receiving recommendations
				const recommendations = map( data.recommendations, ( recommendation ) => {
					return omit( recommendation, 'meta' );
				} );

				dispatch( receiveRecommendations( recommendations ) );

				dispatch( {
					type: READER_START_RECOMMENDATIONS_REQUEST_SUCCESS,
					data
				} );
			},
			( error ) => {
				dispatch( {
					type: READER_START_RECOMMENDATIONS_REQUEST_FAILURE,
					error
				} );
			}
		);
	};
}
