/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import debugModule from 'debug';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import ConnectHeader from './connect-header';
import observe from 'lib/mixins/data-observe';
import Card from 'components/card';
import Gravatar from 'components/gravatar';
import Button from 'components/button';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import { validateSSONonce, authorizeSSO } from 'state/jetpack-connect/actions';
import addQueryArgs from 'lib/route/add-query-args';
import config from 'config';
import EmptyContent from 'components/empty-content';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

/*
 * Module variables
 */
const debug = debugModule( 'calypso:jetpack-connect:sso' );

const JetpackSSOForm = React.createClass( {
	displayName: 'JetpackSSOForm',

	mixins: [ observe( 'userModule' ) ],

	componentWillMount() {
		this.maybeValidateSSO();
	},

	componentWillReceiveProps( nextProps ) {
		this.maybeValidateSSO( nextProps );

		if ( nextProps.ssoUrl && ! this.props.ssoUrl ) {
			// After receiving the SSO URL, which will log the user in on remote site,
			// we redirect user to remote site to be logged in.
			//
			// Note: We add `calypso_env` so that when we are redirected back to Calypso,
			// we land in the same development environment.
			let configEnv = config( 'env_id' ) || process.env.NODE_ENV;
			const redirect = addQueryArgs( { calypso_env: configEnv }, nextProps.ssoUrl );
			debug( 'Redirecting to: ' + redirect );
			window.location.href = redirect;
		}
	},

	onApproveSSO( event ) {
		event.preventDefault();

		const { siteId, ssoNonce } = this.props;
		debug( 'Approving sso' );
		this.props.authorizeSSO( siteId, ssoNonce );
	},

	onCancelClick( event ) {
		debug( 'Clicked return to site link' );
		this.returnToSiteFallback( event );
	},

	onTryAgainClick( event ) {
		debug( 'Clicked try again link' );
		this.returnToSiteFallback( event );
	},

	returnToSiteFallback( event ) {
		// If, for some reason, the API request failed and we do not have the admin URL,
		// then fallback to the user's last location.
		if ( ! get( this.props, 'blogDetails.admin_url' ) ) {
			event.preventDefault();
			window.history.back();
		}
	},

	isButtonDisabled() {
		const { nonceValid, isAuthorizing, isValidating, ssoUrl, authorizationError } = this.props;
		return !! ( ! nonceValid || isAuthorizing || isValidating || ssoUrl || authorizationError );
	},

	maybeValidateSSO( props = this.props ) {
		const { ssoNonce, siteId, nonceValid, isAuthorizing, isValidating } = props;

		if ( ssoNonce && siteId && 'undefined' === typeof nonceValid && ! isAuthorizing && ! isValidating ) {
			this.props.validateSSONonce( siteId, ssoNonce );
		}
	},

	maybeRenderAuthorizationError() {
		const { authorizationError } = this.props;

		if ( ! authorizationError ) {
			return null;
		}

		return (
			<Notice
				status="is-error"
				text={ this.translate( 'Oops, something went wrong.' ) }
				showDismiss={ false }>
				<NoticeAction
					href={ get( this.props, 'blogDetails.admin_url', '#' ) }
					onClick={ this.onTryAgainClick }>
					{ this.translate( 'Try again' ) }
				</NoticeAction>
			</Notice>
		);
	},

	renderNoQueryArgsError() {
		return (
			<Main>
				<EmptyContent
					illustration="/calypso/images/drake/drake-whoops.svg"
					title={ this.translate(
						'Oops, this URL should not be accessed directly'
					) }
					line={ this.translate(
						'Please click the {{em}}Log in with WordPress.com button{{/em}} on your Jetpack site.',
						{
							components: {
								em: <em />
							}
						}
					) }
					action={ this.translate( 'Read Single Sign-On Documentation' ) }
					actionURL="https://jetpack.com/support/sso/"
				/>
			</Main>
		);
	},

	render() {
		const user = this.props.userModule.get();
		const { ssoNonce, siteId } = this.props;

		if ( ! ssoNonce || ! siteId ) {
			return this.renderNoQueryArgsError();
		}

		return (
			<Main className="jetpack-connect">
				<div className="jetpack-connect__sso">
					<ConnectHeader
						headerText={ this.translate( 'Connect with WordPress.com' ) }
						subHeaderText={ this.translate(
							'To use Single Sign-On, WordPress.com needs to be able to connect to your account on %(siteName)s', {
								args: {
									siteName: get( this.props, 'blogDetails.title' )
								}
							}
						) }
					/>

					<Card>
						{ this.maybeRenderAuthorizationError() }
						<div className="jetpack-connect__sso__user-profile">
							<Gravatar user={ user } size={ 120 } imgSize={ 400 } />
							<h3 className="jetpack-connect__sso__user-profile-name">
								{ this.translate(
									'Log in as {{strong}}%s{{/strong}}',
									{
										args: user.display_name,
										components: {
											strong: <strong />
										}
									}
								) }
							</h3>
							<div className="jetpack-connect__sso__user-email">
								{ user.email }
							</div>
						</div>

						<div className="jetpack-connect__sso__actions">
							<Button
								primary
								onClick={ this.onApproveSSO }
								disabled={ this.isButtonDisabled() }>
								{ this.translate( 'Log in' ) }
							</Button>
						</div>
					</Card>

					<LoggedOutFormLinks>
						<LoggedOutFormLinkItem
							rel="external"
							href={ get( this.props, 'blogDetails.admin_url', '#' ) }
							onClick={ this.onCancelClick }>
							{ this.translate( 'Return to %(siteName)s', {
								args: {
									siteName: get( this.props, 'blogDetails.title' )
								}
							} ) }
						</LoggedOutFormLinkItem>
					</LoggedOutFormLinks>
				</div>
			</Main>
		);
	}
} );

export default connect(
	state => {
		const { jetpackSSO } = state.jetpackConnect;
		return {
			ssoUrl: get( jetpackSSO, 'ssoUrl' ),
			isAuthorizing: get( jetpackSSO, 'isAuthorizing' ),
			isValidating: get( jetpackSSO, 'isValidating' ),
			nonceValid: get( jetpackSSO, 'nonceValid' ),
			authorizationError: get( jetpackSSO, 'authorizationError' ),
			validationError: get( jetpackSSO, 'validationError' ),
			blogDetails: get( jetpackSSO, 'blogDetails' )
		};
	},
	dispatch => bindActionCreators( { authorizeSSO, validateSSONonce }, dispatch )
)( JetpackSSOForm );
