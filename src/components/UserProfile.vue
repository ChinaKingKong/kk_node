<script setup>
import { ref, reactive, onMounted } from 'vue';
import {
  ElMessage,
  ElForm,
  ElInput,
  ElButton,
  ElCard,
  ElEmpty,
  ElContainer,
  ElMain,
  ElFooter,
  ElDivider,
  ElMessageBox,
} from 'element-plus';
import { User, Message, Phone } from '@element-plus/icons-vue';
import api from '../libs/api';

const isEditing = ref(false);
const profile = reactive({ id: 0, username: '', email: '', phone: '' });
const rules = reactive({
  username: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { validator: validateUsername, trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: ['blur', 'change'] },
  ],
});

function validateUsername(rule, value, callback) {
  if (!value) {
    return callback(new Error('请输入姓名'));
  } else if (/^\d+$/.test(value)) {
    return callback(new Error('姓名不能为纯数字'));
  } else if (/[^a-zA-Z0-9\u4e00-\u9fa5]/.test(value)) {
    return callback(new Error('姓名不能包含乱码符号'));
  } else {
    return callback();
  }
}

const formRef = ref(null);

onMounted(async () => {
  await fetchProfile();
});

/**
 * 异步获取用户信息
 *
 * @returns 无返回值，将获取到的用户信息赋值给全局变量profile
 */
async function fetchProfile() {
  try {
    const { data } = await api.get('/api/profile');
    if (data) {
      Object.assign(profile, data);
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  }
}

/**
 * 保存用户信息
 *
 * @returns 异步函数，无返回值
 */
async function saveProfile() {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const { data } = await api.post('/api/profile', profile);
        Object.assign(profile, data);
        isEditing.value = false;
        ElMessage.success('保存成功');
      } catch (error) {
        if (error.response.status == 400) {
          ElMessage.error(error.response.data.error);
        } else {
          console.error('Failed to save profile:', error);
          ElMessage.error('保存失败');
        }
      }
    }
  });
}

/**
 * 删除用户
 *
 * @returns 无返回值，异步操作
 */
async function deleteUser() {
  ElMessageBox.confirm('确定删除用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const response = await api.delete(`/api/profile/${profile.id}`);
      if (response.status === 200) {
        profile.id = 0;
        profile.username = '';
        profile.email = '';
        profile.phone = '';
        ElMessage.success('删除成功');
      } else {
        ElMessage.error('删除失败');
      }
    } catch (error) {
      console.error('Failed to delete profile:', error);
      ElMessage.error('删除失败');
    }
  });
}

/**
 * 重置个人信息表单
 *
 * @returns 无返回值
 */
function resetProfile() {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  isEditing.value = true;
}
</script>

<template>
  <el-card class="profile-card" header="用户信息">
    <template v-if="profile.username && !isEditing">
      <el-form>
        <el-form-item label="姓名:">
          <span>{{ profile.username }}</span>
        </el-form-item>
        <el-divider></el-divider>
        <el-form-item label="邮箱:">
          <span>{{ profile.email }}</span>
        </el-form-item>
        <el-divider></el-divider>
        <el-form-item label="手机:">
          <span>{{ profile.phone }}</span>
        </el-form-item>
      </el-form>
      <div class="btns-view">
        <el-button type="primary" @click="isEditing = true">编辑</el-button>
        <el-button type="danger" @click="deleteUser">删除</el-button>
      </div>
    </template>
    <template v-else-if="isEditing">
      <el-form :model="profile" :rules="rules" ref="formRef">
        <el-container>
          <el-main>
            <el-form-item prop="username">
              <el-input v-model="profile.username" placeholder="请输入姓名" :prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="email">
              <el-input v-model="profile.email" placeholder="请输入邮箱" :prefix-icon="Message" />
            </el-form-item>
            <el-form-item prop="phone">
              <el-input v-model="profile.phone" placeholder="请输入手机号" :prefix-icon="Phone" />
            </el-form-item>
          </el-main>
          <el-footer>
            <el-form-item>
              <div class="del-btn-view">
                <el-button type="primary" @click="saveProfile">保存</el-button>
              </div>
            </el-form-item>
          </el-footer>
        </el-container>
      </el-form>
    </template>
    <template v-else>
      <el-empty description="还没有用户信息哦，快去添加吧~">
        <el-button type="primary" @click="resetProfile">新增用户</el-button>
      </el-empty>
    </template>
  </el-card>
</template>

<style>
.profile-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.el-form-item {
  width: 100%;
}

.el-input {
  width: 100%;
}

.el-button {
  width: 100%;
  max-width: 200px;
  margin-top: 20px;
}

.btns-view {
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
}

.del-btn-view {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
}

@media (max-width: 600px) {
  .profile-card {
    padding: 10px;
  }

  .el-button {
    width: 100%;
  }
}
</style>
