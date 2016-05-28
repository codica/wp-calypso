/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingRecommendations, getRecommendationsInteractedWith } from 'state/reader/start/selectors';
import { requestRecommendations } from 'state/reader/start/actions';

class QueryReaderStartRecommendations extends Component {
	componentWillMount() {
		if ( this.props.isRequestingRecommendations ) {
			return;
		}

		this.props.requestRecommendations( this.props.originSiteId, this.props.originPostId, this.props.limit );
	}

	render() {
		return null;
	}
}

QueryReaderStartRecommendations.propTypes = {
	isRequestingRecommendations: PropTypes.bool,
	requestRecommendations: PropTypes.func,
	originSiteId: PropTypes.number,
	originPostId: PropTypes.number,
	limit: PropTypes.number
};

QueryReaderStartRecommendations.defaultProps = {
	requestRecommendations: () => {},
	originSiteId: null,
	originPostId: null,
	limit: 10
};

export default connect(
	( state ) => {
		return {
			isRequestingRecommendations: isRequestingRecommendations( state )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestRecommendations
		}, dispatch );
	}
)( QueryReaderStartRecommendations );
