var React = require('react');
var createClass = require('create-react-class');
var PropTypes = require('prop-types');
var classNames = require('classnames');

/**
 * A single option within the TypeaheadSelector
 */
var TypeaheadOption = createClass({
    propTypes: {
        customClasses: PropTypes.object,
        customValue: PropTypes.string,
        onClick: PropTypes.func,
        children: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        hover: PropTypes.bool
    },

    getDefaultProps: function () {
        return {
            customClasses: {},
            onClick: function (event) {
                event.preventDefault();
            }
        };
    },

    render: function () {
        var classes = {};
        classes[this.props.customClasses.hover || "hover"] = !!this.props.hover;
        classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;

        if (this.props.customValue) {
            classes[this.props.customClasses.customAdd] = !!this.props.customClasses.customAdd;
        }

        var classList = classNames(classes);

        var title, customOptionChild;
        if (Array.isArray(this.props.children)) {
            title = this.props.children[0];
            customOptionChild = this.props.children[1];
        } else {
            title = this.props.children;
        }

        return React.createElement(
            'li',
            { className: classList, onClick: this._onClick },
            React.createElement(
                'a',
                { href: 'javascript: void 0;', className: this._getClasses(), ref: 'anchor' },
                title
            ),
            customOptionChild && React.createElement(
                'div',
                { className: 'custom-option-child' },
                customOptionChild
            )
        );
    },

    _getClasses: function () {
        var classes = {
            "typeahead-option": true
        };
        classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;

        return classNames(classes);
    },

    _onClick: function (event) {
        event.preventDefault();
        return this.props.onClick(event);
    }
});

module.exports = TypeaheadOption;