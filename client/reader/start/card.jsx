// External dependencies
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import debugModule from 'debug';
import get from 'lodash/get';
import classnames from 'classnames';

// Internal dependencies
import Card from 'components/card';
import StartPostPreview from './post-preview';
import StartCardHeader from './card-header';
import StartCardFooter from './card-footer';
import { recordRecommendationInteraction } from 'state/reader/start/actions';
import { getRecommendationById, hasInteractedWithRecommendation, getChildRecommendationId } from 'state/reader/start/selectors';
import { getSite } from 'state/reader/sites/selectors';
import QueryReaderStartRecommendations from 'components/data/query-reader-start-recommendations';

const debug = debugModule( 'calypso:reader:start' ); //eslint-disable-line no-unused-vars

const StartCard = React.createClass( {
	onCardInteraction() {
		this.props.recordRecommendationInteraction( this.props.recommendationId );
	},

	renderChildRecommendation( parentRecommendation ) {
		return(
			<span>
				<QueryReaderStartRecommendations originSiteId={ parentRecommendation.recommended_site_ID } originPostId={ parentRecommendation.recommended_post_ID } limit={ 1 } />
				<StartCard recommendationId={ this.props.childRecommendationId } />
			</span>
		);
	},

	render() {
		const { recommendation, site, siteId, postId } = this.props;
		const headerImage = site.header_image;

		let heroStyle;
		if ( headerImage ) {
			heroStyle = {
				backgroundImage: `url("${ headerImage.url }")`
			};
		}

		const cardClasses = classnames(
			'reader-start-card',
			{
				'has-post-preview': ( postId > 0 )
			}
		);

		return (
			<span>
				<Card className={ cardClasses } onClick={ this.onCardInteraction }>
					<div className="reader-start-card__hero" style={ heroStyle }></div>
					<StartCardHeader siteId={ siteId } />
					{ postId > 0 && <StartPostPreview siteId={ siteId } postId={ postId } /> }
					<StartCardFooter siteId={ siteId } />
				</Card>
				{ this.props.showChildRecommendation && this.props.childRecommendationId && this.renderChildRecommendation( recommendation ) }
			</span>
		);
	}
} );

StartCard.propTypes = {
	recommendationId: React.PropTypes.number.isRequired
};

export default connect(
	( state, ownProps ) => {
		const recommendation = getRecommendationById( state, ownProps.recommendationId );
		const siteId = get( recommendation, 'recommended_site_ID' );
		const postId = get( recommendation, 'recommended_post_ID' );
		const site = getSite( state, siteId );
		const showChildRecommendation = hasInteractedWithRecommendation( state, ownProps.recommendationId );
		let childRecommendationId = null;
		if ( showChildRecommendation ) {
			childRecommendationId = getChildRecommendationId( state, ownProps.recommendationId );
		}

		return {
			recommendation,
			siteId,
			postId,
			site,
			showChildRecommendation,
			childRecommendationId
		};
	},
	( dispatch ) => bindActionCreators( {
		recordRecommendationInteraction
	}, dispatch )
)( StartCard );
