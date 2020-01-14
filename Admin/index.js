import React, { Component } from 'react';

import { compose } from 'recompose';

import * as ROLES from '../../../constants/roles';
import { withAuthorization } from '../../.app-core/Session';
import { withFirebase } from '../../.app-core/Firebase';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faEdit, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Table, Col, Row, CardHeader, CardBody, Card, Input } from 'reactstrap';

import jsonData from './../../../constants/roles.json'

class AdminPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      users: [],
      newUser: '',
      newUserRole: '',
      editUID: '',
      editRole: '',
      pending: false
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.users().on('value', snapshot => {
      const usersObject = snapshot.val();
      const usersList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key,
      }));

      this.setState({
        users: usersList,
        loading: false,
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  deleteUser = (uid, evt) => {
    this.props.firebase.user(uid).remove();
  }

  addUser = () => {
    var email = this.state.newUser.replace("@", "*").replace(/\./g,"++");
    this.props.firebase.checkRole(email).set({ roles: this.state.newUserRole });
    this.setState({newUser: '', newUserRole: '' });
  }

  handleInputChange = event => {
    this.setState({newUser: event.target.value });
  }
  handleNewRoleChange = event => {
    this.setState({newUserRole: event.target.value });
  }
  editUser = (uid,evt) =>{
    this.setState({ editUID: uid });
  }
  handleRoleEdit = event => {
    this.setState({editRole: event.target.value });
  }
  addRole = (uid, roles) => {
    roles = roles + "," + this.state.editRole;
    this.props.firebase.user(uid).update({roles: roles});
    this.setState({editRole: '', editUID: '' });
  }
  viewPending = () => {
    this.setState({pending: !this.state.pending })
    if (this.state.pending) {
      this.props.firebase.users().on('value', snapshot => {
        const usersObject = snapshot.val();
        const usersList = Object.keys(usersObject).map(key => ({
          ...usersObject[key],
          uid: key,
        }));
  
        this.setState({
          users: usersList,
          loading: false,
        });
      });
    } else {
      var usersList = [];
      this.props.firebase.pending().on('value', snapshot => {
        const usersObject = snapshot.val();
        usersList = Object.keys(usersObject).map(key => ({
          ...usersObject[key],
          uid: key,
        }));
  
        this.setState({
          users: usersList,
          loading: false,
        });
      });
    }
  }

  render() {
    const { users, loading } = this.state;
    const roles = jsonData.roles;
    return (
      <div>
        <Row>
          <Col xs="12">
            <Card>
              <CardHeader>
                <h2>User Administration</h2>
                {loading && <div>Loading ...</div>}
              </CardHeader>
              <CardBody>
                <Row className="col-12">
                  <Col xs="4">&nbsp;</Col>
                  <Col xs="3" offset="5">
                    <Input type="email" value={this.state.newUser} onChange={this.handleInputChange} />
                  </Col>
                  <Col xs="3">
                    <Input type="select" id="role" value={this.state.newUserRole} onChange={this.handleNewRoleChange}>
                      { roles.map(r => (
                          <option key={r} value={r}>{r}</option>
                      ))}
                    </Input>
                  </Col>
                  <Col xs="2">
                    <button onClick={(evt) => this.addUser()} className="mr-2">
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                    <button onClick={(evt) => this.viewPending()}>
                      { !this.state.pending && (
                        <FontAwesomeIcon icon={faEye} />
                      )}
                      { this.state.pending && (
                        <FontAwesomeIcon icon={faEyeSlash} />
                      )}
                    </button>
                  </Col>
                </Row>
              </CardBody>
              <CardBody>
                { !this.state.pending && (
                  <UserList users={this.state.users} deleteUser={this.deleteUser} editUser={this.editUser} editUID={this.state.editUID}
                     roles={roles} editRole={this.state.editRole} roleEdit={this.handleRoleEdit} addRole={this.addRole} />
                )}
                { this.state.pending && (
                  <PendingList users={this.state.users} deleteUser={this.deleteUser} editUser={this.editUser} editUID={this.state.editUID}
                     roles={roles} editRole={this.state.editRole} roleEdit={this.handleRoleEdit} addRole={this.addRole} />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

const UserList = ({ users, deleteUser, editUser, editUID, roles, editRole, addRole, roleEdit }) => (
  <Row>
    <Table striped={true}>
      <thead>
        <tr>
          <th>User Name</th>
          <th>Name</th>
          <th>Roles</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
            <tr key={user.uid}>
              <td>{user.email}</td>
              <td>{user.username}</td>
              <td>
                  {user.roles}
                  {editUID === user.uid &&
                    <Row>
                      <Col xs="10">
                        <Input type="select" id="role" value={editRole} onChange={roleEdit}>
                          { roles.map(r => (
                              <option value={r}>{r}</option>
                          ))}
                        </Input>
                      </Col>
                      <Col xs="2">
                        <button onClick={(evt) => addRole(user.uid, user.roles)}>
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </Col>
                    </Row>
                  }
              </td>
              <td>
                {editUID !== user.uid &&
                  <button onClick={(evt) => editUser(user.uid, evt)}>
                      <FontAwesomeIcon icon={faEdit} />
                  </button>
                }
                {!user.roles.includes(ROLES.SUPERADMIN) &&
                  <button onClick={(evt) => deleteUser(user.uid, evt)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Row>
);

const PendingList = ({ users, deleteUser, editUser, editUID, roles, editRole, addRole, roleEdit }) => (
  <Row>
    <Table striped={true}>
      <thead>
        <tr>
          <th>User Name</th>
          <th>Roles</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
            <tr key={user.uid}>
              <td>{user.uid.replace("*","@").replace(new RegExp(/\+\+/, "g"),".")}</td>
              <td>
                  {user.roles}
              </td>
              <td>
                {user.roles && !user.roles.includes(ROLES.SUPERADMIN) &&
                  <button onClick={(evt) => deleteUser(user.uid, evt)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Row>
);

const condition = authUser => authUser && authUser.roles.length > 0 && (!!authUser.roles.includes(ROLES.ADMIN)|| !!authUser.roles.includes(ROLES.SUPERADMIN));

export default compose(withAuthorization(condition), withFirebase)(AdminPage);