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
import { getRecommendationById } from 'state/reader/start/selectors';
import { getSite } from 'state/reader/sites/selectors';

const debug = debugModule( 'calypso:reader:start' ); //eslint-disable-line no-unused-vars

const StartCard = React.createClass( {
	onCardInteraction() {
		this.props.recordRecommendationInteraction(
			this.props.recommendationId,
			this.props.recommendation.recommended_site_ID,
			this.props.recommendation.recommended_post_ID
		);
	},

	render() {
		debug( this.props );
		const { site, siteId, postId } = this.props;

		if ( ! site ) {
			return null;
		}

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
			<Card className={ cardClasses } onClick={ this.onCardInteraction }>
				<div className="reader-start-card__hero" style={ heroStyle }></div>
				<StartCardHeader siteId={ siteId } />
				{ postId > 0 && <StartPostPreview siteId={ siteId } postId={ postId } /> }
				<StartCardFooter siteId={ siteId } />
			</Card>
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

		return {
			recommendation,
			siteId,
			postId,
			site
		};
	},
	( dispatch ) => bindActionCreators( {
		recordRecommendationInteraction
	}, dispatch )
)( StartCard );
