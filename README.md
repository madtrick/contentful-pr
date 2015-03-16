# SPR

`spr` is a small command line utility that includes some goodies to streamline the creation of pull requests in Github.

Some of this goodies are:

* Specification of the assignee
* Usage of templates for pull request messages
* Integration with [Target Process](http://www.targetprocess.com/)


## Installation

```
npm install -g spr
```

## Usage

```bash
$spr -h

Options:
  -a, --assignee  Github name of the pull request assignee
  -b, --base      Specify the base branch to merge the pull request into
  -h, --help      This help
  -v, --verbose   Be verbose
  -t, --template  Path to template to be used in pull request message
  --tp            Id of Target Process entity
```

### Configuration

```json
$cat $HOME/.spr

{
  "credentials": {
    "github": {
      "type": "oauth",
      "token": ""
    },
      "targetprocess": {
        "domain": "",
        "username": "",
        "password": ""
      }
  }
}
```
### Target Process integration

This tool does the following regarding Target Process

  * Creates a comment in the ticket referenced by the given id including a link to the created pull request
  * Replaces the string `:tp-ticket-id:` in the message template with the given ticket id
