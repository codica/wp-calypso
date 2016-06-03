/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

export default React.createClass( {
	displayName: 'FAQ',

	propTypes: {
		heading: PropTypes.string,
		items: PropTypes.arrayOf(
			PropTypes.shape( {
				question: PropTypes.string.isRequired,
				answer: PropTypes.node.isRequired
			} )
		).isRequired
	},

	getDefaultProps() {
		return {
			heading: this.translate( 'Frequently Asked Questions' )
		};
	},

	render() {
		const { heading, items } = this.props;

		return (
			<div className="faq">
				<h1 className="faq__heading">{ heading }</h1>
				<ul className="faq__list">
					{
						items.map( ( { question, answer }, ind ) =>
							<li className="faq__item" key={ `faq-${ ind }` }>
								<h4 className="faq__question">{ question }</h4>
								<p className="faq__answer">{ answer }</p>
							</li>
						)
					}
				</ul>
			</div>
		);
	}
} );
